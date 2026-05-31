'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { WorkoutSession, ExerciseLog, SetLog } from '@/types'
import { toISODate } from '@/lib/utils'

export function useWorkoutHistory() {
  const sessions = useLiveQuery(async () => {
    const db = getDB()
    const all = await db.workoutSessions
      .filter((s) => s.status === 'completed')
      .sortBy('date')
    return all.reverse()
  }, [])

  const last7Days = useLiveQuery(async () => {
    const db = getDB()
    const cutoff = toISODate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    return db.workoutSessions
      .filter((s) => s.status === 'completed' && s.date >= cutoff)
      .toArray()
  }, [])

  const weeklyVolume = useLiveQuery(async () => {
    const db = getDB()
    // Last 8 weeks
    const weeks: { date: string; volumeKg: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - i * 7 - 6)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i * 7)

      const startStr = toISODate(weekStart)
      const endStr = toISODate(weekEnd)

      const weekSessions = await db.workoutSessions
        .filter(
          (s) => s.status === 'completed' && s.date >= startStr && s.date <= endStr,
        )
        .toArray()

      const volumeKg = weekSessions.reduce((sum, s) => sum + (s.totalVolumeKg ?? 0), 0)
      weeks.push({ date: endStr, volumeKg })
    }
    return weeks
  }, [])

  async function getSession(id: number): Promise<{
    session: WorkoutSession
    exerciseLogs: ExerciseLog[]
    setLogs: SetLog[]
  }> {
    const db = getDB()
    const session = await db.workoutSessions.get(id)
    if (!session) throw new Error(`Session ${id} not found`)

    const exerciseLogs = await db.exerciseLogs
      .filter((el) => el.sessionId === id)
      .sortBy('orderIndex')

    const setLogs = await db.setLogs
      .filter((sl) => sl.sessionId === id)
      .sortBy('setNumber')

    return { session, exerciseLogs, setLogs }
  }

  async function deleteSession(id: number): Promise<void> {
    const db = getDB()
    await db.transaction('rw', db.workoutSessions, db.exerciseLogs, db.setLogs, async () => {
      await db.workoutSessions.delete(id)
      const exLogs = await db.exerciseLogs.filter((el) => el.sessionId === id).toArray()
      for (const el of exLogs) {
        if (el.id) await db.setLogs.filter((sl) => sl.exerciseLogId === el.id!).delete()
      }
      await db.exerciseLogs.filter((el) => el.sessionId === id).delete()
    })
  }

  return {
    sessions: sessions ?? [],
    last7Days: last7Days ?? [],
    weeklyVolume: weeklyVolume ?? [],
    getSession,
    deleteSession,
  }
}
