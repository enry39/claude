'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { today, getLast7Days } from '@/lib/utils'
import type { StepEntry } from '@/types'

export function useStepsLog() {
  const db = getDB()
  const todayStr = today()
  const last7DaysList = getLast7Days()
  const start7 = last7DaysList[0]
  const end7 = last7DaysList[last7DaysList.length - 1]

  const entries = useLiveQuery(
    () => db.stepEntries.orderBy('date').reverse().toArray(),
    []
  )

  const todayEntry = useLiveQuery(
    () => db.stepEntries.where('date').equals(todayStr).first(),
    [todayStr]
  )

  const last7Days = useLiveQuery(
    () =>
      db.stepEntries
        .where('date')
        .between(start7, end7, true, true)
        .sortBy('date'),
    [start7, end7]
  )

  const weeklyTotal: number = (last7Days ?? []).reduce(
    (sum, e) => sum + e.steps,
    0,
  )

  const weeklyAverage: number = (() => {
    const data = last7Days ?? []
    if (data.length === 0) return 0
    return Math.round(weeklyTotal / data.length)
  })()

  async function addEntry(data: Omit<StepEntry, 'id' | 'loggedAt'>): Promise<void> {
    // Upsert: if entry for this date exists, replace it
    const existing = await db.stepEntries.where('date').equals(data.date).first()
    if (existing?.id !== undefined) {
      await db.stepEntries.update(existing.id, {
        ...data,
        loggedAt: new Date().toISOString(),
      })
    } else {
      await db.stepEntries.add({
        ...data,
        loggedAt: new Date().toISOString(),
      })
    }
  }

  async function deleteEntry(id: number): Promise<void> {
    await db.stepEntries.delete(id)
  }

  return {
    entries: entries ?? [],
    addEntry,
    deleteEntry,
    todayEntry,
    last7Days: last7Days ?? [],
    weeklyTotal,
    weeklyAverage,
  }
}
