'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { getLast30Days, getLast7Days, toISODate } from '@/lib/utils'

function generateInsights(params: {
  avgSleepMinutes: number
  weeklyWorkouts: number
  weightTrend: 'up' | 'down' | 'stable'
  monthlyVolume: number
  goal?: string
}): string[] {
  const { avgSleepMinutes, weeklyWorkouts, weightTrend, monthlyVolume, goal } = params
  const insights: string[] = []

  const avgSleepHours = avgSleepMinutes / 60

  if (avgSleepMinutes > 0 && avgSleepHours < 7) {
    insights.push(
      'Questa settimana hai dormito meno di 7 ore in media. Il recupero muscolare avviene nel sonno — priorità!',
    )
  }

  if (weeklyWorkouts >= 5) {
    insights.push('Frequenza eccellente! 5+ sessioni questa settimana.')
  }

  if (weightTrend === 'down' && goal === 'bulk') {
    insights.push(
      'Il peso sta scendendo — aumenta le calorie se l\'obiettivo è massa.',
    )
  }

  if (monthlyVolume > 0) {
    insights.push(
      `Volume mensile: ${Math.round(monthlyVolume).toLocaleString('it-IT')} kg. Continua a progredire!`,
    )
  }

  return insights
}

export function useAnalytics() {
  const last7DaysList = getLast7Days()
  const { start: monthStart, end: monthEnd } = getLast30Days()

  const weeklyWorkouts = useLiveQuery(async () => {
    const db = getDB()
    const cutoff = last7DaysList[0]
    const sessions = await db.workoutSessions
      .filter((s) => s.status === 'completed' && s.date >= cutoff)
      .toArray()
    return sessions.length
  }, [])

  const monthlyVolume = useLiveQuery(async () => {
    const db = getDB()
    const sessions = await db.workoutSessions
      .filter(
        (s) =>
          s.status === 'completed' &&
          s.date >= monthStart &&
          s.date <= monthEnd,
      )
      .toArray()
    return sessions.reduce((sum, s) => sum + (s.totalVolumeKg ?? 0), 0)
  }, [])

  const avgSleepLast7 = useLiveQuery(async () => {
    const db = getDB()
    const cutoff = last7DaysList[0]
    const entries = await db.sleepEntries
      .filter((s) => s.date >= cutoff)
      .toArray()
    if (entries.length === 0) return 0
    const totalMinutes = entries.reduce((sum, s) => sum + s.durationMinutes, 0)
    return Math.round(totalMinutes / entries.length)
  }, [])

  const avgCaloriesLast7 = useLiveQuery(async () => {
    const db = getDB()
    const cutoff = last7DaysList[0]
    const entries = await db.foodLogEntries
      .filter((e) => e.date >= cutoff)
      .toArray()
    if (entries.length === 0) return 0
    // Group by date and compute daily totals
    const byDate = new Map<string, number>()
    for (const e of entries) {
      byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.calories)
    }
    const days = Array.from(byDate.values())
    if (days.length === 0) return 0
    return Math.round(days.reduce((s, v) => s + v, 0) / days.length)
  }, [])

  const weightTrend = useLiveQuery(async () => {
    const db = getDB()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 14)
    const cutoff = toISODate(cutoffDate)

    const entries = await db.weightEntries
      .filter((w) => w.date >= cutoff)
      .sortBy('date')

    if (entries.length < 2) return 'stable' as const

    const half = Math.floor(entries.length / 2)
    const firstHalf = entries.slice(0, half)
    const secondHalf = entries.slice(half)

    const avgFirst =
      firstHalf.reduce((s, e) => s + e.weightKg, 0) / firstHalf.length
    const avgSecond =
      secondHalf.reduce((s, e) => s + e.weightKg, 0) / secondHalf.length

    const delta = avgSecond - avgFirst
    if (delta > 0.3) return 'up' as const
    if (delta < -0.3) return 'down' as const
    return 'stable' as const
  }, [])

  const userGoal = useLiveQuery(async () => {
    const db = getDB()
    const profile = await db.userProfile.get(1)
    return profile?.goal
  }, [])

  const sleepVsVolume = useLiveQuery(async () => {
    const db = getDB()
    const result: { date: string; sleepHours: number; volumeKg: number }[] = []

    for (const date of last7DaysList) {
      const sleepEntry = await db.sleepEntries.filter((s) => s.date === date).first()
      const daySessions = await db.workoutSessions
        .filter((s) => s.status === 'completed' && s.date === date)
        .toArray()
      const volumeKg = daySessions.reduce((sum, s) => sum + (s.totalVolumeKg ?? 0), 0)
      const sleepHours = sleepEntry ? sleepEntry.durationMinutes / 60 : 0
      result.push({ date, sleepHours, volumeKg })
    }

    return result
  }, [])

  const weeklyVolumeByMuscle = useLiveQuery(async () => {
    const db = getDB()
    const cutoff = last7DaysList[0]

    const sessions = await db.workoutSessions
      .filter((s) => s.status === 'completed' && s.date >= cutoff)
      .toArray()

    if (sessions.length === 0) return []

    const sessionIds = sessions.map((s) => s.id as number)
    const setLogs = await db.setLogs
      .filter((sl) => sessionIds.includes(sl.sessionId))
      .toArray()

    const exerciseIds = [...new Set(setLogs.map((sl) => sl.exerciseId))]
    const exercises = await db.exercises
      .filter((ex) => exerciseIds.includes(ex.id as number))
      .toArray()

    const exerciseMap = new Map(exercises.map((ex) => [ex.id as number, ex]))
    const muscleVolume = new Map<string, number>()

    for (const sl of setLogs) {
      if (sl.isWarmup) continue
      const ex = exerciseMap.get(sl.exerciseId)
      if (!ex) continue
      const volume = sl.weightKg * sl.reps
      for (const muscle of ex.muscles) {
        muscleVolume.set(muscle, (muscleVolume.get(muscle) ?? 0) + volume)
      }
    }

    return Array.from(muscleVolume.entries())
      .map(([muscle, volumeKg]) => ({ muscle, volumeKg }))
      .sort((a, b) => b.volumeKg - a.volumeKg)
  }, [])

  const insights = generateInsights({
    avgSleepMinutes: avgSleepLast7 ?? 0,
    weeklyWorkouts: weeklyWorkouts ?? 0,
    weightTrend: weightTrend ?? 'stable',
    monthlyVolume: monthlyVolume ?? 0,
    goal: userGoal,
  })

  return {
    weeklyWorkouts: weeklyWorkouts ?? 0,
    monthlyVolume: monthlyVolume ?? 0,
    avgSleepLast7: avgSleepLast7 ?? 0,
    avgCaloriesLast7: avgCaloriesLast7 ?? 0,
    weightTrend: weightTrend ?? ('stable' as const),
    sleepVsVolume: sleepVsVolume ?? [],
    weeklyVolumeByMuscle: weeklyVolumeByMuscle ?? [],
    insights,
  }
}
