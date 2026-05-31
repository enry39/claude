'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { getLast30Days, toISODate } from '@/lib/utils'
import type { WeightEntry } from '@/types'

interface MovingAveragePoint {
  date: string
  weightKg: number
  movingAvg: number
}

export function useWeightLog() {
  const db = getDB()
  const { start, end } = getLast30Days()

  const entries = useLiveQuery(
    () => db.weightEntries.orderBy('date').reverse().toArray(),
    []
  )

  const last30Days = useLiveQuery(
    () => db.weightEntries.where('date').between(start, end, true, true).sortBy('date'),
    [start, end]
  )

  const safeEntries = entries ?? []
  const safeLast30 = last30Days ?? []

  const movingAverage7d: MovingAveragePoint[] = safeLast30.map((entry, idx) => {
    const windowStart = Math.max(0, idx - 6)
    const window = safeLast30.slice(windowStart, idx + 1)
    const avg = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length
    return {
      date: entry.date,
      weightKg: entry.weightKg,
      movingAvg: Math.round(avg * 10) / 10,
    }
  })

  const latestWeight: number | undefined =
    safeEntries.length > 0 ? safeEntries[0].weightKg : undefined

  async function addEntry(data: Omit<WeightEntry, 'id' | 'loggedAt'>): Promise<void> {
    await db.weightEntries.add({
      ...data,
      loggedAt: new Date().toISOString(),
    })
  }

  async function deleteEntry(id: number): Promise<void> {
    await db.weightEntries.delete(id)
  }

  return {
    entries: safeEntries,
    addEntry,
    deleteEntry,
    latestWeight,
    last30Days: safeLast30,
    movingAverage7d,
  }
}
