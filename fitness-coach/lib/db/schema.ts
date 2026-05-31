'use client'
import Dexie, { type Table } from 'dexie'
import type {
  UserProfile, MacroTargets,
  Exercise, WorkoutProgram, WorkoutSession, ExerciseLog, SetLog, PersonalRecord,
  FoodItem, FoodLogEntry,
  WeightEntry, BodyMeasurement, ProgressPhoto,
  SleepEntry, StepEntry,
  VideoEntry, SavedPaper,
} from '@/types'

export class FitnessDB extends Dexie {
  userProfile!: Table<UserProfile>
  macroTargets!: Table<MacroTargets>
  exercises!: Table<Exercise>
  workoutPrograms!: Table<WorkoutProgram>
  workoutSessions!: Table<WorkoutSession>
  exerciseLogs!: Table<ExerciseLog>
  setLogs!: Table<SetLog>
  personalRecords!: Table<PersonalRecord>
  foodItems!: Table<FoodItem>
  foodLogEntries!: Table<FoodLogEntry>
  weightEntries!: Table<WeightEntry>
  bodyMeasurements!: Table<BodyMeasurement>
  progressPhotos!: Table<ProgressPhoto>
  sleepEntries!: Table<SleepEntry>
  stepEntries!: Table<StepEntry>
  videoEntries!: Table<VideoEntry>
  savedPapers!: Table<SavedPaper>

  constructor() {
    super('FitnessCoachDB')
    this.version(1).stores({
      userProfile:      'id',
      macroTargets:     'id',
      exercises:        '++id, name, *muscles, equipment, category, isCustom',
      workoutPrograms:  '++id, name, isActive, createdAt',
      workoutSessions:  '++id, programId, date, status',
      exerciseLogs:     '++id, sessionId, exerciseId',
      setLogs:          '++id, sessionId, exerciseId, exerciseLogId, completedAt, isPR',
      personalRecords:  '++id, exerciseId, type, date',
      foodItems:        '++id, name, isCustom',
      foodLogEntries:   '++id, date, meal, foodItemId',
      weightEntries:    '++id, date',
      bodyMeasurements: '++id, date',
      progressPhotos:   '++id, date',
      sleepEntries:     '++id, date',
      stepEntries:      '++id, date',
      videoEntries:     '++id, category, *tags, createdAt',
      savedPapers:      '++id, source, externalId, *tags, savedAt',
    })
  }
}

let _db: FitnessDB | null = null

export function getDB(): FitnessDB {
  if (!_db) _db = new FitnessDB()
  return _db
}
