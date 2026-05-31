'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { getLast7Days, getLast30Days } from '@/lib/utils'
import type { SleepEntry } from '@/types'

export function useSleepLog() {
  const db = getDB()
  const last7DaysList = getLast7Days()
  const { start: start30, end: end30 } = getLast30Days()

  const start7 = last7DaysList[0]
  const end7 = last7DaysList[last7DaysList.length - 1]

  const entries = useLiveQuery(
    () => db.sleepEntries.orderBy('date').reverse().toArray(),
    []
  )

  const last7Days = useLiveQuery(
    () =>
      db.sleepEntries
        .where('date')
        .between(start7, end7, true, true)
        .sortBy('date'),
    [start7, end7]
  )

  const last30Days = useLiveQuery(
    () =>
      db.sleepEntries
        .where('date')
        .between(start30, end30, true, true)
        .sortBy('date'),
    [start30, end30]
  )

  const averageDuration: number = (() => {
    const data = last7Days ?? []
    if (data.length === 0) return 0
    return Math.round(data.reduce((sum, e) => sum + e.durationMinutes, 0) / data.length)
  })()

  const averageQuality: number = (() => {
    const data = last7Days ?? []
    if (data.length === 0) return 0
    return Math.round((data.reduce((sum, e) => sum + e.qualityScore, 0) / data.length) * 10) / 10
  })()

  async function addEntry(data: Omit<SleepEntry, 'id' | 'loggedAt'>): Promise<void> {
    await db.sleepEntries.add({
      ...data,
      loggedAt: new Date().toISOString(),
    })
  }

  async function deleteEntry(id: number): Promise<void> {
    await db.sleepEntries.delete(id)
  }

  return {
    entries: entries ?? [],
    addEntry,
    deleteEntry,
    last7Days: last7Days ?? [],
    last30Days: last30Days ?? [],
    averageDuration,
    averageQuality,
  }
}
