'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import type { FoodLogEntry, FoodItem, MealType } from '@/types'

interface TotalMacros {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
}

interface AddFoodLogEntryData {
  meal: MealType
  foodItemId: number
  foodItemName: string
  amountG: number
}

export function useFoodLog(date: string) {
  const db = getDB()

  const entries = useLiveQuery(
    () => db.foodLogEntries.where('date').equals(date).sortBy('loggedAt'),
    [date]
  )

  const foodItems = useLiveQuery(
    () => db.foodItems.orderBy('name').toArray(),
    []
  )

  const safeEntries = entries ?? []
  const safeFoodItems = foodItems ?? []

  const totalMacros: TotalMacros = safeEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
      fiberG: acc.fiberG + e.fiberG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  )

  function searchFoodItems(query: string): FoodItem[] {
    const q = query.toLowerCase().trim()
    if (!q) return safeFoodItems
    return safeFoodItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.brand?.toLowerCase().includes(q) ?? false)
    )
  }

  async function addEntry(data: AddFoodLogEntryData): Promise<void> {
    const item = safeFoodItems.find((f) => f.id === data.foodItemId)
    if (!item) throw new Error(`Food item ${data.foodItemId} not found`)

    const factor = data.amountG / 100
    const entry: Omit<FoodLogEntry, 'id'> = {
      date,
      meal: data.meal,
      foodItemId: data.foodItemId,
      foodItemName: data.foodItemName,
      amountG: data.amountG,
      calories: Math.round(item.caloriesPer100g * factor),
      proteinG: Math.round(item.proteinPer100g * factor * 10) / 10,
      carbsG: Math.round(item.carbsPer100g * factor * 10) / 10,
      fatG: Math.round(item.fatPer100g * factor * 10) / 10,
      fiberG: Math.round(item.fiberPer100g * factor * 10) / 10,
      loggedAt: new Date().toISOString(),
    }
    await db.foodLogEntries.add(entry)
  }

  async function deleteEntry(id: number): Promise<void> {
    await db.foodLogEntries.delete(id)
  }

  async function addCustomFood(data: {
    name: string
    caloriesPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    fiberPer100g?: number
    brand?: string
  }): Promise<number> {
    return db.foodItems.add({
      ...data,
      fiberPer100g: data.fiberPer100g ?? 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }) as Promise<number>
  }

  return {
    entries: safeEntries,
    totalMacros,
    addEntry,
    deleteEntry,
    addCustomFood,
    foodItems: safeFoodItems,
    searchFoodItems,
  }
}
