import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: toISODate(start), end: toISODate(end) }
}

export function getLast30Days(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  return { start: toISODate(start), end: toISODate(end) }
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toISODate(d))
  }
  return days
}

export function formatKg(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal)} kcal`
}

export function formatMacro(g: number): string {
  return `${Math.round(g)}g`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function clampPercent(value: number, max: number): number {
  if (max === 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

export function dayName(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { weekday: 'long' })
}

export function dayNameShort(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { weekday: 'short' })
}

export function epley1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}
