'use client'

import { useState, useCallback } from 'react'
import { getDB } from '@/lib/db/schema'
import type { ActiveExercise, ActiveSet, WorkoutSession, ExerciseLog, SetLog, PersonalRecord } from '@/types'
import { today, toISODate, epley1RM } from '@/lib/utils'

interface ActiveSessionState {
  sessionName: string
  startTime: string
  programId?: number
  exercises: ActiveExercise[]
  currentExerciseIndex: number
}

export function useWorkoutSession() {
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(null)

  const startSession = useCallback(
    (sessionName: string, exercises: ActiveExercise[], programId?: number) => {
      setActiveSession({
        sessionName,
        startTime: new Date().toISOString(),
        programId,
        exercises: exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.length > 0
            ? ex.sets.map((s) => ({ ...s, id: crypto.randomUUID() }))
            : [
                {
                  id: crypto.randomUUID(),
                  weightKg: 0,
                  reps: 0,
                  isWarmup: false,
                  completed: false,
                },
              ],
        })),
        currentExerciseIndex: 0,
      })
    },
    [],
  )

  const addSet = useCallback(
    (exerciseIndex: number, set: Omit<ActiveSet, 'id'>) => {
      setActiveSession((prev) => {
        if (!prev) return prev
        const exercises = prev.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex
          return {
            ...ex,
            sets: [
              ...ex.sets,
              { ...set, id: crypto.randomUUID() },
            ],
          }
        })
        return { ...prev, exercises }
      })
    },
    [],
  )

  const updateSet = useCallback(
    (exerciseIndex: number, setId: string, update: Partial<ActiveSet>) => {
      setActiveSession((prev) => {
        if (!prev) return prev
        const exercises = prev.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...update } : s)),
          }
        })
        return { ...prev, exercises }
      })
    },
    [],
  )

  const removeSet = useCallback(
    (exerciseIndex: number, setId: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev
        const exercises = prev.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
          }
        })
        return { ...prev, exercises }
      })
    },
    [],
  )

  const toggleSetComplete = useCallback(
    (exerciseIndex: number, setId: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev
        const exercises = prev.exercises.map((ex, i) => {
          if (i !== exerciseIndex) return ex
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, completed: !s.completed } : s,
            ),
          }
        })
        return { ...prev, exercises }
      })
    },
    [],
  )

  const finishSession = useCallback(
    async (notes?: string): Promise<number> => {
      if (!activeSession) throw new Error('No active session')

      const db = getDB()
      const endTime = new Date().toISOString()
      const dateStr = toISODate(new Date())

      // Calculate total volume from completed sets
      let totalVolumeKg = 0
      for (const ex of activeSession.exercises) {
        for (const set of ex.sets) {
          if (set.completed && !set.isWarmup) {
            totalVolumeKg += set.weightKg * set.reps
          }
        }
      }

      // Save WorkoutSession
      const sessionId = (await db.workoutSessions.add({
        programId: activeSession.programId,
        workoutDayName: activeSession.sessionName,
        date: dateStr,
        startTime: activeSession.startTime,
        endTime,
        status: 'completed',
        totalVolumeKg,
        notes,
      })) as number

      // For each exercise, determine PRs and save logs
      for (let exIdx = 0; exIdx < activeSession.exercises.length; exIdx++) {
        const ex = activeSession.exercises[exIdx]

        // Save ExerciseLog
        const exerciseLogId = (await db.exerciseLogs.add({
          sessionId,
          exerciseId: ex.exerciseId,
          orderIndex: exIdx,
          notes: ex.notes,
        })) as number

        // Compute best 1RM estimate for this exercise in this session
        let bestEstimated1RM = 0
        let bestSet: ActiveSet | null = null

        for (const set of ex.sets) {
          if (!set.completed || set.isWarmup || set.reps === 0 || set.weightKg === 0) continue
          const estimated = epley1RM(set.weightKg, set.reps)
          if (estimated > bestEstimated1RM) {
            bestEstimated1RM = estimated
            bestSet = set
          }
        }

        // Check existing PR for this exercise
        const existingPR = await db.personalRecords
          .filter((r) => r.exerciseId === ex.exerciseId && r.type === '1rm')
          .first()

        const isNewPR =
          bestEstimated1RM > 0 &&
          (!existingPR || bestEstimated1RM > existingPR.value)

        // Save SetLogs
        for (let setIdx = 0; setIdx < ex.sets.length; setIdx++) {
          const set = ex.sets[setIdx]
          if (!set.completed) continue

          const isPR = isNewPR && bestSet !== null && set.id === bestSet.id

          await db.setLogs.add({
            exerciseLogId,
            sessionId,
            exerciseId: ex.exerciseId,
            setNumber: setIdx + 1,
            weightKg: set.weightKg,
            reps: set.reps,
            rpe: set.rpe,
            isWarmup: set.isWarmup,
            isPR,
            completedAt: endTime,
          })
        }

        // Save/update PersonalRecord if new PR found
        if (isNewPR && bestSet) {
          const setLogForPR = await db.setLogs
            .filter(
              (sl) =>
                sl.sessionId === sessionId &&
                sl.exerciseId === ex.exerciseId &&
                sl.isPR === true,
            )
            .first()

          const prData: PersonalRecord = {
            exerciseId: ex.exerciseId,
            type: '1rm',
            value: bestEstimated1RM,
            sessionId,
            setLogId: setLogForPR?.id as number | undefined,
            date: dateStr,
            previousValue: existingPR?.value,
          }

          if (existingPR?.id) {
            await db.personalRecords.update(existingPR.id, prData)
          } else {
            await db.personalRecords.add(prData)
          }
        }
      }

      setActiveSession(null)
      return sessionId
    },
    [activeSession],
  )

  const addExercise = useCallback((exercise: ActiveExercise) => {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            ...exercise,
            sets: exercise.sets.length > 0
              ? exercise.sets.map(s => ({ ...s, id: crypto.randomUUID() }))
              : [{ id: crypto.randomUUID(), weightKg: 0, reps: 0, isWarmup: false, completed: false }],
          },
        ],
      }
    })
  }, [])

  const cancelSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  return {
    activeSession,
    isActive: activeSession !== null,
    startSession,
    addSet,
    updateSet,
    removeSet,
    toggleSetComplete,
    addExercise,
    finishSession,
    cancelSession,
  }
}
