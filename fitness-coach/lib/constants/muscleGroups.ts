export const MUSCLE_GROUPS = [
  'petto',
  'schiena',
  'spalle',
  'bicipiti',
  'tricipiti',
  'avambracci',
  'trapezio',
  'quadricipiti',
  'femorali',
  'glutei',
  'polpacci',
  'core',
  'addominali',
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

export const MUSCLE_COLORS: Record<string, string> = {
  petto: '#6366f1',
  schiena: '#22d3ee',
  spalle: '#f59e0b',
  bicipiti: '#10b981',
  tricipiti: '#f43f5e',
  avambracci: '#a78bfa',
  trapezio: '#34d399',
  quadricipiti: '#fb923c',
  femorali: '#e879f9',
  glutei: '#fbbf24',
  polpacci: '#38bdf8',
  core: '#4ade80',
  addominali: '#f87171',
}

export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'other',
] as const

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Bilanciere',
  dumbbell: 'Manubri',
  cable: 'Cavi',
  machine: 'Macchina',
  bodyweight: 'Corpo libero',
  other: 'Altro',
}

export const MEAL_LABELS: Record<string, string> = {
  colazione: 'Colazione',
  pranzo: 'Pranzo',
  cena: 'Cena',
  spuntino_mattina: 'Spuntino mattina',
  spuntino_pomeriggio: 'Spuntino pomeriggio',
  post_workout: 'Post workout',
}

export const VIDEO_CATEGORY_LABELS: Record<string, string> = {
  esercizi: 'Esercizi',
  nutrizione: 'Nutrizione',
  integrazione: 'Integrazione',
  tecnica: 'Tecnica & Correzione',
  mindset: 'Mindset',
  altro: 'Altro',
}

export const PAPER_TAGS = [
  'ipertrofia',
  'forza',
  'nutrizione',
  'proteine',
  'carboidrati',
  'grassi',
  'supplementi',
  'creatina',
  'recupero',
  'sonno',
  'cardio',
  'periodizzazione',
  'volume',
  'intensità',
  'frequenza',
  'biomeccanica',
]

export const GOAL_LABELS: Record<string, string> = {
  bulk: 'Massa',
  cut: 'Definizione',
  maintain: 'Mantenimento',
  recomp: 'Ricomposizione',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentario',
  light: 'Leggero',
  moderate: 'Moderato',
  active: 'Attivo',
  very_active: 'Molto attivo',
}
