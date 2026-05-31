'use client'
import { useState } from 'react'
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import { Search, Plus, Dumbbell } from 'lucide-react'
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, EQUIPMENT_LABELS, MUSCLE_COLORS } from '@/lib/constants/muscleGroups'
import type { Exercise } from '@/types'

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card className="group hover:border-[var(--primary)] transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium text-sm truncate">{exercise.name}</p>
              {exercise.isCustom && (
                <Badge variant="outline" className="text-xs shrink-0">Custom</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {exercise.muscles.map(m => (
                <span
                  key={m}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${MUSCLE_COLORS[m] ?? 'var(--primary)'}20`,
                    color: MUSCLE_COLORS[m] ?? 'var(--primary)',
                  }}
                >
                  {m}
                </span>
              ))}
              {exercise.secondaryMuscles.slice(0, 2).map(m => (
                <span
                  key={m}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {exercise.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AddExerciseModal({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (data: Omit<Exercise, 'id' | 'createdAt' | 'isCustom'>) => void
}) {
  const [name, setName] = useState('')
  const [muscles, setMuscles] = useState<string>('')
  const [secondaryMuscles, setSecondaryMuscles] = useState<string>('')
  const [equipment, setEquipment] = useState<string>('barbell')
  const [category, setCategory] = useState<string>('compound')
  const [instructions, setInstructions] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      muscles: muscles.split(',').map(s => s.trim()).filter(Boolean),
      secondaryMuscles: secondaryMuscles.split(',').map(s => s.trim()).filter(Boolean),
      equipment,
      category,
      instructions: instructions.trim() || undefined,
    })
    setName('')
    setMuscles('')
    setSecondaryMuscles('')
    setEquipment('barbell')
    setCategory('compound')
    setInstructions('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Esercizio Custom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome esercizio" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Muscoli primari (separati da virgola)
            </label>
            <Input value={muscles} onChange={e => setMuscles(e.target.value)} placeholder="es. petto, tricipiti" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Muscoli secondari (separati da virgola)
            </label>
            <Input value={secondaryMuscles} onChange={e => setSecondaryMuscles(e.target.value)} placeholder="es. spalle" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Attrezzo</label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map(e => (
                    <SelectItem key={e} value={e}>{EQUIPMENT_LABELS[e] ?? e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compound">Composto</SelectItem>
                  <SelectItem value="isolation">Isolamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Istruzioni (opzionale)</label>
            <Input value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Note sull'esecuzione..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Annulla</Button>
            <Button onClick={handleSubmit} disabled={!name.trim()}>Aggiungi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EserciziPage() {
  const {
    exercises, search, setSearch,
    filterMuscle, setFilterMuscle,
    filterEquipment, setFilterEquipment,
    addCustomExercise,
  } = useExerciseLibrary()
  const [showAdd, setShowAdd] = useState(false)

  const totalExercises = exercises.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Libreria Esercizi</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">
            {totalExercises} esercizi disponibili
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Aggiungi Custom
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca esercizio..."
            className="pl-9"
          />
        </div>
        <Select value={filterMuscle} onValueChange={setFilterMuscle}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tutti i muscoli" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i muscoli</SelectItem>
            {MUSCLE_GROUPS.map(m => (
              <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEquipment} onValueChange={setFilterEquipment}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tutti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutto</SelectItem>
            {EQUIPMENT_TYPES.map(e => (
              <SelectItem key={e} value={e}>{EQUIPMENT_LABELS[e] ?? e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={32} />}
          title="Nessun esercizio trovato"
          description="Prova a modificare i filtri o aggiungi un esercizio custom"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {exercises.map(ex => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}

      <AddExerciseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addCustomExercise}
      />
    </div>
  )
}
