'use client'
import { useState, useEffect, useRef } from 'react'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { useWorkoutPrograms } from '@/hooks/useWorkoutPrograms'
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary'
import { usePersonalRecords } from '@/hooks/usePersonalRecords'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Play, Plus, Trash2, Check, Timer, Trophy, ChevronDown, ChevronUp,
  Dumbbell, AlertCircle, X, CheckCircle2
} from 'lucide-react'
import { formatKg, epley1RM } from '@/lib/utils'
import type { ActiveExercise, ActiveSet, Exercise } from '@/types'
import { useRouter } from 'next/navigation'

// Rest Timer Component
function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) { onDone(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, running, onDone])

  const pct = (remaining / seconds) * 100
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke="var(--primary)" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - pct / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-mono font-bold">
            {min}:{sec.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setRunning(r => !r)}>
          {running ? 'Pausa' : 'Riprendi'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Salta</Button>
      </div>
    </div>
  )
}

// Set Row Component
function SetRow({
  set, setNumber, exerciseId,
  onToggle, onDelete, onUpdate, prValue,
}: {
  set: ActiveSet
  setNumber: number
  exerciseId: number
  onToggle: () => void
  onDelete: () => void
  onUpdate: (field: 'weightKg' | 'reps', value: number) => void
  prValue?: number
}) {
  const est1rm = set.reps > 0 && set.weightKg > 0 ? epley1RM(set.weightKg, set.reps) : 0
  const isPR = prValue !== undefined && est1rm > prValue

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg"
      style={{
        background: set.completed ? 'rgba(99,102,241,0.08)' : 'var(--surface-2)',
        border: `1px solid ${set.completed ? 'var(--primary)' : 'transparent'}`,
      }}
    >
      <span className="w-6 text-center text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
        {set.isWarmup ? 'W' : setNumber}
      </span>
      <Input
        type="number"
        value={set.weightKg || ''}
        onChange={e => onUpdate('weightKg', parseFloat(e.target.value) || 0)}
        placeholder="kg"
        className="w-20 text-center text-sm"
        style={{ padding: '4px 8px', height: '32px' }}
      />
      <span style={{ color: 'var(--text-muted)' }} className="text-xs">×</span>
      <Input
        type="number"
        value={set.reps || ''}
        onChange={e => onUpdate('reps', parseInt(e.target.value) || 0)}
        placeholder="reps"
        className="w-16 text-center text-sm"
        style={{ padding: '4px 8px', height: '32px' }}
      />
      {isPR && (
        <Badge variant="warning" className="text-xs px-1">PR!</Badge>
      )}
      {est1rm > 0 && (
        <span className="text-xs hidden sm:block" style={{ color: 'var(--text-dim)' }}>
          ~{formatKg(est1rm)}
        </span>
      )}
      <button
        onClick={onToggle}
        className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{
          background: set.completed ? 'var(--primary)' : 'var(--border)',
          color: set.completed ? 'white' : 'var(--text-muted)',
        }}
      >
        <Check size={14} />
      </button>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ color: 'var(--text-dim)' }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

// Add Exercise Modal
function AddExerciseModal({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (exercise: ActiveExercise) => void
}) {
  const { exercises, search, setSearch } = useExerciseLibrary()
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [restSeconds, setRestSeconds] = useState(90)

  function handleAdd() {
    if (!selected) return
    onAdd({
      exerciseId: selected.id!,
      exerciseName: selected.name,
      muscles: selected.muscles,
      sets: [{ id: crypto.randomUUID(), weightKg: 0, reps: 0, isWarmup: false, completed: false }],
      restSeconds,
    })
    setSelected(null)
    setSearch('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi Esercizio</DialogTitle>
        </DialogHeader>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca esercizio..."
          className="mt-2"
          autoFocus
        />
        <div className="flex-1 overflow-y-auto mt-3 space-y-1">
          {exercises.slice(0, 20).map(ex => (
            <button
              key={ex.id}
              className="w-full text-left p-3 rounded-lg transition-colors"
              style={{
                background: selected?.id === ex.id ? 'var(--primary-muted)' : 'var(--surface-2)',
                border: `1px solid ${selected?.id === ex.id ? 'var(--primary)' : 'transparent'}`,
              }}
              onClick={() => setSelected(ex)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{ex.name}</span>
                <div className="flex gap-1">
                  {ex.muscles.slice(0, 2).map(m => (
                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            <p className="text-sm font-medium mb-2">{selected.name}</p>
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Recupero (sec):</label>
              <Input
                type="number"
                value={restSeconds}
                onChange={e => setRestSeconds(parseInt(e.target.value) || 90)}
                className="w-20"
                style={{ height: '32px', padding: '4px 8px' }}
              />
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Annulla</Button>
          <Button onClick={handleAdd} disabled={!selected} className="flex-1">Aggiungi</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function WorkoutLogPage() {
  const router = useRouter()
  const { activeProgram } = useWorkoutPrograms()
  const { activeSession, isActive, startSession, addSet, updateSet, removeSet, toggleSetComplete, addExercise, finishSession, cancelSession } = useWorkoutSession()
  const { getRecordForExercise } = usePersonalRecords()

  const [sessionName, setSessionName] = useState('')
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restDuration, setRestDuration] = useState(90)
  const [elapsed, setElapsed] = useState(0)
  const [prBanner, setPrBanner] = useState(false)
  const [notes, setNotes] = useState('')
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (!isActive) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [isActive])

  async function handleFinish() {
    setFinishing(true)
    try {
      const id = await finishSession(notes)
      router.push('/allenamenti')
    } catch (e) {
      console.error(e)
    } finally {
      setFinishing(false)
    }
  }

  function handleAddSet(exerciseIndex: number) {
    const lastSet = activeSession?.exercises[exerciseIndex]?.sets.slice(-1)[0]
    addSet(exerciseIndex, {
      weightKg: lastSet?.weightKg ?? 0,
      reps: lastSet?.reps ?? 0,
      isWarmup: false,
      completed: false,
    })
  }

  function handleSetComplete(exerciseIndex: number, setId: string) {
    toggleSetComplete(exerciseIndex, setId)
    const ex = activeSession?.exercises[exerciseIndex]
    if (ex) {
      setRestDuration(ex.restSeconds)
      setShowRestTimer(true)
    }
  }

  const elapsedMin = Math.floor(elapsed / 60)
  const elapsedSec = elapsed % 60

  if (!isActive) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Nuova Sessione</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Nome sessione</label>
              <Input
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                placeholder="Es. Push, Pull, Legs A, Upper..."
              />
            </div>
            {activeProgram && (
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Programma attivo: <span className="font-medium text-white">{activeProgram.name}</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {activeProgram.days.map((day, i) => (
                    <button
                      key={i}
                      className="p-3 rounded-lg text-left text-sm border transition-colors hover:border-[var(--primary)]"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                      onClick={() => setSessionName(day.name)}
                    >
                      <span className="font-medium">{day.name}</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {day.exercises.length} esercizi pianificati
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button
              className="w-full"
              disabled={!sessionName.trim()}
              onClick={() => startSession(sessionName, [])}
            >
              <Play size={16} className="mr-2" />
              Inizia Allenamento
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Session Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="font-bold">{activeSession?.sessionName}</h2>
          <p className="text-sm font-mono" style={{ color: 'var(--primary)' }}>
            {elapsedMin}:{elapsedSec.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={cancelSession}>
            <X size={14} className="mr-1" />
            Annulla
          </Button>
          <Button size="sm" onClick={handleFinish} disabled={finishing}>
            <CheckCircle2 size={14} className="mr-1" />
            Termina
          </Button>
        </div>
      </div>

      {/* Rest Timer */}
      {showRestTimer && (
        <RestTimer seconds={restDuration} onDone={() => setShowRestTimer(false)} />
      )}

      {/* Exercises */}
      {activeSession?.exercises.map((ex, exIdx) => {
        const record = getRecordForExercise(ex.exerciseId, '1rm')
        const completedSets = ex.sets.filter(s => s.completed).length
        return (
          <Card key={exIdx}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{ex.exerciseName}</CardTitle>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {ex.muscles.join(', ')} · {completedSets}/{ex.sets.length} serie
                    {record && ` · PR: ${formatKg(record.value)}`}
                  </p>
                </div>
                <Badge variant={completedSets === ex.sets.length && ex.sets.length > 0 ? 'success' : 'default'}>
                  {completedSets}/{ex.sets.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Set Headers */}
              <div className="flex gap-2 px-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                <span className="w-6 text-center">#</span>
                <span className="w-20 text-center">kg</span>
                <span className="w-4" />
                <span className="w-16 text-center">reps</span>
              </div>
              {ex.sets.map((set, setIdx) => {
                const workSets = ex.sets.filter(s => !s.isWarmup)
                const setNum = set.isWarmup ? 0 : workSets.indexOf(set) + 1
                return (
                  <SetRow
                    key={set.id}
                    set={set}
                    setNumber={setNum}
                    exerciseId={ex.exerciseId}
                    onToggle={() => handleSetComplete(exIdx, set.id)}
                    onDelete={() => removeSet(exIdx, set.id)}
                    onUpdate={(field, value) => updateSet(exIdx, set.id, { [field]: value })}
                    prValue={record?.value}
                  />
                )
              })}
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-1"
                onClick={() => handleAddSet(exIdx)}
              >
                <Plus size={14} className="mr-1" />
                Aggiungi serie
              </Button>
            </CardContent>
          </Card>
        )
      })}

      {/* Empty / Add Exercise */}
      {activeSession?.exercises.length === 0 && (
        <EmptyState
          icon={<Dumbbell size={32} />}
          title="Nessun esercizio"
          description="Aggiungi il primo esercizio alla sessione"
        />
      )}

      <Button
        className="w-full"
        variant="outline"
        onClick={() => setShowAddExercise(true)}
      >
        <Plus size={16} className="mr-2" />
        Aggiungi Esercizio
      </Button>

      {/* Notes */}
      <Card>
        <CardContent className="p-4">
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Note sessione..."
          />
        </CardContent>
      </Card>

      <AddExerciseModal
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onAdd={ex => {
          addExercise(ex)
          setShowAddExercise(false)
        }}
      />
    </div>
  )
}
