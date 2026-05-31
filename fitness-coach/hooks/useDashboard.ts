'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { today, getLast7Days, getWeekRange } from '@/lib/utils'

export function useDashboard() {
  const todayStr = today()
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const last7 = getLast7Days()

  const todayFoodEntries = useLiveQuery(
    () => getDB().foodLogEntries.where('date').equals(todayStr).toArray(),
    [todayStr]
  ) ?? []

  const todayWeight = useLiveQuery(
    () => getDB().weightEntries.where('date').equals(todayStr).first(),
    [todayStr]
  )

  const latestWeight = useLiveQuery(
    () => getDB().weightEntries.orderBy('date').last(),
    []
  )

  const todaySleep = useLiveQuery(
    () => getDB().sleepEntries.where('date').equals(todayStr).first(),
    [todayStr]
  )

  const todaySteps = useLiveQuery(
    () => getDB().stepEntries.where('date').equals(todayStr).first(),
    [todayStr]
  )

  const weekSessions = useLiveQuery(
    () => getDB().workoutSessions
      .where('date').between(weekStart, weekEnd, true, true)
      .filter(s => s.status === 'completed')
      .toArray(),
    [weekStart, weekEnd]
  ) ?? []

  const recentSessions = useLiveQuery(
    () => getDB().workoutSessions
      .where('status').equals('completed')
      .reverse()
      .limit(5)
      .toArray(),
    []
  ) ?? []

  const macroTargets = useLiveQuery(
    () => getDB().macroTargets.get(1),
    []
  )

  const recentPRs = useLiveQuery(
    () => getDB().personalRecords.orderBy('date').reverse().limit(5).toArray(),
    []
  ) ?? []

  const last7WeightEntries = useLiveQuery(
    () => getDB().weightEntries
      .where('date').between(last7[0], last7[last7.length - 1], true, true)
      .toArray(),
    [last7[0]]
  ) ?? []

  const todayMacros = todayFoodEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  const totalStreak = useLiveQuery(async () => {
    const sessions = await getDB().workoutSessions
      .where('status').equals('completed')
      .toArray()
    const dates = new Set(sessions.map(s => s.date))
    let streak = 0
    let d = new Date()
    while (streak < 365) {
      const dateStr = d.toISOString().split('T')[0]
      if (!dates.has(dateStr)) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }, []) ?? 0

  return {
    todayMacros,
    macroTargets,
    latestWeight: todayWeight?.weightKg ?? latestWeight?.weightKg,
    todaySleep,
    todaySteps,
    weekSessions,
    recentSessions,
    recentPRs,
    last7WeightEntries,
    streak: totalStreak,
    isLoading: false,
  }
}
