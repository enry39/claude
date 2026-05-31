'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { PersonalRecord } from '@/types'

export function usePersonalRecords() {
  const records = useLiveQuery(async () => {
    const db = getDB()
    return db.personalRecords.orderBy('date').reverse().toArray()
  }, [])

  function getRecordForExercise(
    exerciseId: number,
    type: '1rm',
  ): PersonalRecord | undefined {
    if (!records) return undefined
    return records.find((r) => r.exerciseId === exerciseId && r.type === type)
  }

  const recentPRs = (records ?? []).slice(0, 5)

  return {
    records: records ?? [],
    getRecordForExercise,
    recentPRs,
  }
}
