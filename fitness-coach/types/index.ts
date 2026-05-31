// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: 1
  name: string
  age: number
  heightCm: number
  targetWeightKg: number
  goal: 'bulk' | 'cut' | 'maintain' | 'recomp'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  units: { weight: 'kg' | 'lbs'; height: 'cm' | 'in' }
  updatedAt: string
}

export interface MacroTargets {
  id: 1
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  updatedAt: string
}

// ─── WORKOUT ──────────────────────────────────────────────────────────────────

export interface Exercise {
  id?: number
  name: string
  muscles: string[]
  secondaryMuscles: string[]
  equipment: string
  category: string
  instructions?: string
  videoUrl?: string
  isCustom: boolean
  createdAt: string
}

export interface WorkoutDay {
  dayIndex: number
  name: string
  exercises: PlannedExercise[]
}

export interface PlannedExercise {
  exerciseId: number
  sets: number
  repsMin: number
  repsMax: number
  rpeTarget?: number
  restSeconds: number
  notes?: string
  orderIndex: number
}

export interface WorkoutProgram {
  id?: number
  name: string
  split: string
  daysPerWeek: number
  days: WorkoutDay[]
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkoutSession {
  id?: number
  programId?: number
  workoutDayName: string
  date: string
  startTime: string
  endTime?: string
  status: 'active' | 'completed' | 'skipped'
  totalVolumeKg: number
  notes?: string
  mood?: number
  perceivedRecovery?: number
}

export interface ExerciseLog {
  id?: number
  sessionId: number
  exerciseId: number
  orderIndex: number
  notes?: string
}

export interface SetLog {
  id?: number
  exerciseLogId: number
  sessionId: number
  exerciseId: number
  setNumber: number
  weightKg: number
  reps: number
  rpe?: number
  restAfterSeconds?: number
  isWarmup: boolean
  isPR: boolean
  completedAt: string
}

export interface PersonalRecord {
  id?: number
  exerciseId: number
  type: '1rm' | 'volume' | 'reps_at_weight'
  value: number
  setLogId?: number
  sessionId?: number
  date: string
  previousValue?: number
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────

export type MealType = 'colazione' | 'pranzo' | 'cena' | 'spuntino_mattina' | 'spuntino_pomeriggio' | 'post_workout'

export interface FoodItem {
  id?: number
  name: string
  brand?: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  isCustom: boolean
  createdAt: string
}

export interface FoodLogEntry {
  id?: number
  date: string
  meal: MealType
  foodItemId: number
  foodItemName: string
  amountG: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  loggedAt: string
}

// ─── BODY ─────────────────────────────────────────────────────────────────────

export interface WeightEntry {
  id?: number
  date: string
  weightKg: number
  bodyFatPct?: number
  notes?: string
  loggedAt: string
}

export interface BodyMeasurement {
  id?: number
  date: string
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftArmCm?: number
  rightArmCm?: number
  leftThighCm?: number
  rightThighCm?: number
  leftCalfCm?: number
  rightCalfCm?: number
  neckCm?: number
  shouldersCm?: number
  notes?: string
  loggedAt: string
}

export interface ProgressPhoto {
  id?: number
  date: string
  angle: 'front' | 'back' | 'side_left' | 'side_right' | 'custom'
  lightingCondition?: string
  pumpLevel?: number
  weightAtTime?: number
  notes?: string
  tags?: string[]
  createdAt: string
}

// ─── SLEEP ────────────────────────────────────────────────────────────────────

export interface SleepEntry {
  id?: number
  date: string
  bedtime: string
  wakeTime: string
  durationMinutes: number
  qualityScore: number
  deepSleepMinutes?: number
  remMinutes?: number
  awakenings?: number
  notes?: string
  loggedAt: string
}

// ─── STEPS ────────────────────────────────────────────────────────────────────

export interface StepEntry {
  id?: number
  date: string
  steps: number
  activeCalories?: number
  distanceKm?: number
  notes?: string
  loggedAt: string
}

// ─── VIDEO ────────────────────────────────────────────────────────────────────

export type VideoCategory = 'esercizi' | 'nutrizione' | 'integrazione' | 'tecnica' | 'mindset' | 'altro'

export interface VideoEntry {
  id?: number
  title: string
  youtubeId: string
  category: VideoCategory
  tags: string[]
  notes?: string
  durationSeconds?: number
  channelName?: string
  watchedCount: number
  lastWatchedAt?: string
  createdAt: string
}

// ─── PAPERS ───────────────────────────────────────────────────────────────────

export interface SavedPaper {
  id?: number
  source: 'pubmed' | 'arxiv'
  externalId: string
  title: string
  authors: string[]
  abstract: string
  publishedDate: string
  journal?: string
  doi?: string
  url: string
  tags: string[]
  notes?: string
  rating?: number
  savedAt: string
  updatedAt: string
}

export interface PaperSearchResult {
  source: 'pubmed' | 'arxiv'
  externalId: string
  title: string
  authors: string[]
  abstract: string
  publishedDate: string
  journal?: string
  url: string
}

// ─── ACTIVE SESSION (ephemeral context) ──────────────────────────────────────

export interface ActiveSet {
  id: string
  weightKg: number
  reps: number
  rpe?: number
  isWarmup: boolean
  completed: boolean
}

export interface ActiveExercise {
  exerciseId: number
  exerciseName: string
  muscles: string[]
  sets: ActiveSet[]
  notes?: string
  restSeconds: number
}
