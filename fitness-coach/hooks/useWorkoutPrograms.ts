'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { WorkoutProgram } from '@/types'
import { today } from '@/lib/utils'

export function useWorkoutPrograms() {
  const programs = useLiveQuery(async () => {
    const db = getDB()
    const all = await db.workoutPrograms.orderBy('createdAt').toArray()
    return all.reverse()
  }, [])

  const activeProgram = useLiveQuery(async () => {
    const db = getDB()
    return db.workoutPrograms.filter((p) => p.isActive).first()
  }, [])

  const isLoading = programs === undefined

  async function createProgram(
    data: Omit<WorkoutProgram, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> {
    const db = getDB()
    const now = new Date().toISOString()
    const id = await db.workoutPrograms.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return id as number
  }

  async function updateProgram(id: number, data: Partial<WorkoutProgram>): Promise<void> {
    const db = getDB()
    await db.workoutPrograms.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  async function deleteProgram(id: number): Promise<void> {
    const db = getDB()
    await db.workoutPrograms.delete(id)
  }

  async function setActive(id: number): Promise<void> {
    const db = getDB()
    const now = new Date().toISOString()
    // Deactivate all programs first
    const all = await db.workoutPrograms.toArray()
    await db.transaction('rw', db.workoutPrograms, async () => {
      for (const p of all) {
        if (p.id !== id && p.isActive) {
          await db.workoutPrograms.update(p.id as number, {
            isActive: false,
            updatedAt: now,
          })
        }
      }
      await db.workoutPrograms.update(id, {
        isActive: true,
        updatedAt: now,
      })
    })
  }

  return {
    programs: programs ?? [],
    activeProgram: activeProgram ?? null,
    createProgram,
    updateProgram,
    deleteProgram,
    setActive,
    isLoading,
  }
}
