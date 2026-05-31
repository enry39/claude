'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { SEED_EXERCISES } from '@/lib/db/seed'
import type { Exercise } from '@/types'
import { useState, useEffect } from 'react'
import { today } from '@/lib/utils'

export function useExerciseLibrary() {
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState('')
  const [filterEquipment, setFilterEquipment] = useState('')
  const [seeded, setSeeded] = useState(false)

  const allExercises = useLiveQuery(async () => {
    const db = getDB()
    return db.exercises.orderBy('name').toArray()
  }, [])

  // Seed on first mount if empty
  useEffect(() => {
    if (seeded) return
    if (allExercises === undefined) return // still loading

    if (allExercises.length === 0) {
      const db = getDB()
      db.exercises.bulkAdd(SEED_EXERCISES as Exercise[]).catch(() => {
        // Already seeded or error — ignore
      })
    }
    setSeeded(true)
  }, [allExercises, seeded])

  const exercises: Exercise[] = (allExercises ?? []).filter((ex) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      q === '' ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscles.some((m) => m.toLowerCase().includes(q)) ||
      ex.secondaryMuscles.some((m) => m.toLowerCase().includes(q))

    const matchesMuscle =
      filterMuscle === '' || filterMuscle === 'all' ||
      ex.muscles.includes(filterMuscle) ||
      ex.secondaryMuscles.includes(filterMuscle)

    const matchesEquipment =
      filterEquipment === '' || filterEquipment === 'all' || ex.equipment === filterEquipment

    return matchesSearch && matchesMuscle && matchesEquipment
  })

  async function addCustomExercise(
    data: Omit<Exercise, 'id' | 'isCustom' | 'createdAt'>,
  ): Promise<number> {
    const db = getDB()
    const id = await db.exercises.add({
      ...data,
      isCustom: true,
      createdAt: new Date().toISOString(),
    })
    return id as number
  }

  const isLoading = allExercises === undefined

  return {
    exercises,
    search,
    setSearch,
    filterMuscle,
    setFilterMuscle,
    filterEquipment,
    setFilterEquipment,
    addCustomExercise,
    isLoading,
  }
}
