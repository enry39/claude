'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db/schema'
import { today } from '@/lib/utils'
import type { UserProfile, MacroTargets } from '@/types'

export const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  name: 'Athlete',
  age: 25,
  heightCm: 178,
  targetWeightKg: 85,
  goal: 'bulk',
  activityLevel: 'active',
  units: { weight: 'kg', height: 'cm' },
  updatedAt: today(),
}

export const DEFAULT_MACRO_TARGETS: MacroTargets = {
  id: 1,
  calories: 2500,
  proteinG: 180,
  carbsG: 250,
  fatG: 80,
  fiberG: 30,
  updatedAt: today(),
}

export function useSettings() {
  const db = getDB()

  const profile = useLiveQuery(
    async () => {
      const p = await db.userProfile.get(1)
      return p ?? DEFAULT_PROFILE
    },
    []
  )

  const macroTargets = useLiveQuery(
    async () => {
      const m = await db.macroTargets.get(1)
      return m ?? DEFAULT_MACRO_TARGETS
    },
    []
  )

  const resolvedProfile = profile ?? DEFAULT_PROFILE
  const resolvedMacros = macroTargets ?? DEFAULT_MACRO_TARGETS

  async function saveProfile(data: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
    const existing = await db.userProfile.get(1)
    const next: UserProfile = {
      ...(existing ?? DEFAULT_PROFILE),
      ...data,
      id: 1,
      updatedAt: today(),
    }
    await db.userProfile.put(next)
  }

  async function saveMacroTargets(data: Partial<Omit<MacroTargets, 'id'>>): Promise<void> {
    const existing = await db.macroTargets.get(1)
    const next: MacroTargets = {
      ...(existing ?? DEFAULT_MACRO_TARGETS),
      ...data,
      id: 1,
      updatedAt: today(),
    }
    await db.macroTargets.put(next)
  }

  return {
    profile: resolvedProfile,
    macroTargets: resolvedMacros,
    saveProfile,
    saveMacroTargets,
    isLoading: profile === undefined || macroTargets === undefined,
  }
}

export function useMacroTargets() {
  const db = getDB()

  const targets = useLiveQuery(
    async () => {
      const m = await db.macroTargets.get(1)
      return m ?? DEFAULT_MACRO_TARGETS
    },
    []
  )

  return {
    targets: targets ?? DEFAULT_MACRO_TARGETS,
    isLoading: targets === undefined,
  }
}
