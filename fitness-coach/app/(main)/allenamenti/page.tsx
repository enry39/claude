'use client'
import { useState } from 'react'
import { useWorkoutPrograms } from '@/hooks/useWorkoutPrograms'
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dumbbell, Plus, Calendar, Zap, Trophy, ChevronRight, Play, Trash2, CheckCircle } from 'lucide-react'
import { formatDate, formatKg, today } from '@/lib/utils'
import Link from 'next/link'
import type { WorkoutProgram, WorkoutDay, PlannedExercise } from '@/types'

function ProgramCard({
  program,
  onSetActive,
  onDelete,
}: {
  program: WorkoutProgram
  onSetActive: (id: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{program.name}</CardTitle>
              {program.isActive && (
                <Badge variant="success" className="text-xs">Attivo</Badge>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              {program.split} · {program.daysPerWeek} giorni/settimana
            </p>
          </div>
          <div className="flex gap-1">
            {!program.isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetActive(program.id!)}
              >
                Attiva
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300"
              onClick={() => onDelete(program.id!)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {program.days.map((day, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: 'var(--surface-2)' }}
            >
              <span className="text-sm font-medium">{day.name}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {day.exercises.length} esercizi
              </span>
            </div>
          ))}
        </div>
        {program.notes && (
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>{program.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}

function CreateProgramModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: Omit<WorkoutProgram, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [name, setName] = useState('')
  const [split, setSplit] = useState('PPL')
  const [days, setDays] = useState<WorkoutDay[]>([
    { dayIndex: 0, name: 'Push', exercises: [] },
    { dayIndex: 1, name: 'Pull', exercises: [] },
    { dayIndex: 2, name: 'Legs', exercises: [] },
  ])
  const [notes, setNotes] = useState('')

  function addDay() {
    setDays(d => [...d, { dayIndex: d.length, name: `Giorno ${d.length + 1}`, exercises: [] }])
  }
  function removeDay(i: number) {
    setDays(d => d.filter((_, idx) => idx !== i))
  }
  function updateDayName(i: number, name: string) {
    setDays(d => d.map((day, idx) => idx === i ? { ...day, name } : day))
  }

  function handleCreate() {
    if (!name.trim()) return
    onCreate({
      name: name.trim(),
      split,
      daysPerWeek: days.length,
      days,
      notes: notes.trim() || undefined,
      isActive: false,
    })
    setName('')
    setSplit('PPL')
    setDays([
      { dayIndex: 0, name: 'Push', exercises: [] },
      { dayIndex: 1, name: 'Pull', exercises: [] },
      { dayIndex: 2, name: 'Legs', exercises: [] },
    ])
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo Programma</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Nome programma</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Es. PPL Ipertrofia"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Split</label>
            <Input
              value={split}
              onChange={e => setSplit(e.target.value)}
              placeholder="Es. PPL, Upper/Lower, Full Body"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Giorni di allenamento</label>
              <Button size="sm" variant="outline" onClick={addDay}>+ Giorno</Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {days.map((day, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={day.name}
                    onChange={e => updateDayName(i, e.target.value)}
                    placeholder={`Giorno ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => removeDay(i)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Obiettivi, note..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Annulla</Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>Crea Programma</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AllenamentiPage() {
  const { programs, createProgram, deleteProgram, setActive } = useWorkoutPrograms()
  const { sessions, weeklyVolume } = useWorkoutHistory()
  const [showCreate, setShowCreate] = useState(false)

  const recentSessions = sessions.slice(0, 5)
  const thisWeekSessions = sessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Allenamenti</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
            {thisWeekSessions.length} sessioni questa settimana
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/allenamenti/log">
            <Button>
              <Play size={16} className="mr-2" />
              Inizia Sessione
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-2" />
            Programma
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/allenamenti/log', icon: <Play size={18} />, label: 'Nuova Sessione' },
          { href: '/allenamenti/esercizi', icon: <Dumbbell size={18} />, label: 'Libreria Esercizi' },
          { href: '/allenamenti/record', icon: <Trophy size={18} />, label: 'Personal Record' },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <div
              className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors hover:border-[var(--primary)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--text-dim)' }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Programmi</h2>
        </div>
        {programs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nessun programma"
            description="Crea il tuo primo programma di allenamento"
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} className="mr-2" />
                Crea Programma
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                onSetActive={setActive}
                onDelete={deleteProgram}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sessioni Recenti</h2>
          {sessions.length > 5 && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {sessions.length} totali
            </span>
          )}
        </div>
        {recentSessions.length === 0 ? (
          <EmptyState icon="🏋️" title="Nessuna sessione" description="Inizia il tuo primo allenamento" />
        ) : (
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--primary-muted)' }}
                  >
                    <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s.workoutDayName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(s.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatKg(s.totalVolumeKg)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>volume</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProgramModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createProgram}
      />
    </div>
  )
}
