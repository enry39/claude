'use client'
import { useState } from 'react'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, Trash2, Ruler } from 'lucide-react'
import { formatDate, today } from '@/lib/utils'
import type { BodyMeasurement } from '@/types'

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurement; label: string }[] = [
  { key: 'chestCm', label: 'Petto' },
  { key: 'waistCm', label: 'Vita' },
  { key: 'hipsCm', label: 'Fianchi' },
  { key: 'leftArmCm', label: 'Braccio Sx' },
  { key: 'rightArmCm', label: 'Braccio Dx' },
  { key: 'shouldersCm', label: 'Spalle' },
  { key: 'leftThighCm', label: 'Coscia Sx' },
  { key: 'rightThighCm', label: 'Coscia Dx' },
  { key: 'leftCalfCm', label: 'Polpaccio Sx' },
  { key: 'rightCalfCm', label: 'Polpaccio Dx' },
  { key: 'neckCm', label: 'Collo' },
]

function AddMeasurementModal({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (data: Omit<BodyMeasurement, 'id' | 'loggedAt'>) => void
}) {
  const [date, setDate] = useState(today())
  const [values, setValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')

  function handleSubmit() {
    const data: Omit<BodyMeasurement, 'id' | 'loggedAt'> = { date, notes: notes || undefined }
    for (const field of MEASUREMENT_FIELDS) {
      const v = parseFloat(values[field.key as string])
      if (!isNaN(v) && v > 0) {
        ;(data as any)[field.key] = v
      }
    }
    onAdd(data)
    setDate(today())
    setValues({})
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nuove Misure</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 mt-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map(f => (
              <div key={f.key as string}>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{f.label} (cm)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={values[f.key as string] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [f.key as string]: e.target.value }))}
                  placeholder="cm"
                  style={{ height: '36px', padding: '4px 8px' }}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Note</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opzionale..." />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Annulla</Button>
          <Button onClick={handleSubmit} className="flex-1">Salva</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function MisurePage() {
  const { measurements, addMeasurement, deleteMeasurement, latestMeasurement } = useBodyMeasurements()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ruler size={22} />
            Misure Corporee
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {measurements.length} rilevazioni
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Nuove Misure
        </Button>
      </div>

      {/* Latest Measurements Grid */}
      {latestMeasurement && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Ultime Misure — {formatDate(latestMeasurement.date)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MEASUREMENT_FIELDS.map(f => {
                const val = (latestMeasurement as any)[f.key]
                if (!val) return null
                return (
                  <div key={f.key as string} className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{val}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label} cm</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Storico</h2>
        {measurements.length === 0 ? (
          <EmptyState
            icon="📏"
            title="Nessuna misura"
            description="Inizia a registrare le tue misure corporee"
            action={<Button onClick={() => setShowAdd(true)}><Plus size={16} className="mr-2" />Aggiungi</Button>}
          />
        ) : (
          <div className="space-y-3">
            {measurements.map((m: BodyMeasurement) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold">{formatDate(m.date)}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMeasurement(m.id!)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {MEASUREMENT_FIELDS.map(f => {
                      const val = (m as any)[f.key]
                      if (!val) return null
                      return (
                        <div key={f.key as string} className="text-center">
                          <p className="text-sm font-bold">{val}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                        </div>
                      )
                    })}
                  </div>
                  {m.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{m.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddMeasurementModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addMeasurement}
      />
    </div>
  )
}
