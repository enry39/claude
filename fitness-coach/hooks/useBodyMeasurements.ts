'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { BodyMeasurement } from '@/types'

export function useBodyMeasurements() {
  const measurements = useLiveQuery(async () => {
    const db = getDB()
    const all = await db.bodyMeasurements.orderBy('date').toArray()
    return all.reverse()
  }, [])

  const latestMeasurement = measurements?.[0] ?? null

  async function addMeasurement(
    data: Omit<BodyMeasurement, 'id' | 'loggedAt'>,
  ): Promise<number> {
    const db = getDB()
    const id = await db.bodyMeasurements.add({
      ...data,
      loggedAt: new Date().toISOString(),
    })
    return id as number
  }

  async function deleteMeasurement(id: number): Promise<void> {
    const db = getDB()
    await db.bodyMeasurements.delete(id)
  }

  return {
    measurements: measurements ?? [],
    latestMeasurement,
    addMeasurement,
    deleteMeasurement,
  }
}
