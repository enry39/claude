'use client'

import { useState } from 'react'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Ruler, Plus, Trash2 } from 'lucide-react'
import { formatDate, today } from '@/lib/utils'
import type { BodyMeasurement } from '@/types'

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurement; label: string; shortLabel: string; color: string }[] = [
  { key: 'chestCm', label: 'Petto', shortLabel: 'Petto', color: '#6366f1' },
  { key: 'waistCm', label: 'Vita', shortLabel: 'Vita', color: '#22d3ee' },
  { key: 'hipsCm', label: 'Fianchi', shortLabel: 'Fianchi', color: '#f59e0b' },
  { key: 'shouldersCm', label: 'Spalle', shortLabel: 'Spalle', color: '#10b981' },
  { key: 'neckCm', label: 'Collo', shortLabel: 'Collo', color: '#a78bfa' },
  { key: 'leftArmCm', label: 'Braccio Sx', shortLabel: 'Br.Sx', color: '#f43f5e' },
  { key: 'rightArmCm', label: 'Braccio Dx', shortLabel: 'Br.Dx', color: '#fb923c' },
  { key: 'leftThighCm', label: 'Coscia Sx', shortLabel: 'Co.Sx', color: '#e879f9' },
  { key: 'rightThighCm', label: 'Coscia Dx', shortLabel: 'Co.Dx', color: '#fbbf24' },
  { key: 'leftCalfCm', label: 'Polpaccio Sx', shortLabel: 'Po.Sx', color: '#34d399' },
  { key: 'rightCalfCm', label: 'Polpaccio Dx', shortLabel: 'Po.Dx', color: '#38bdf8' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.fill }}>
          {p.name}: {p.value} cm
        </p>
      ))}
    </div>
  )
}

const CHART_COLORS = ['var(--primary)', 'var(--secondary)', 'var(--accent)']

export default function MisurePage() {
  const { measurements, addMeasurement, deleteMeasurement, latestMeasurement } = useBodyMeasurements()

  const [open, setOpen] = useState(false)
  const [formDate, setFormDate] = useState(today())
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formNotes, setFormNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Omit<BodyMeasurement, 'id' | 'loggedAt'> = {
      date: formDate,
      notes: formNotes || undefined,
    }
    for (const field of MEASUREMENT_FIELDS) {
      const val = parseFloat(formValues[field.key as string] ?? '')
      if (!isNaN(val) && val > 0) {
        ;(data as any)[field.key] = val
      }
    }
    await addMeasurement(data)
    setOpen(false)
    setFormDate(today())
    setFormValues({})
    setFormNotes('')
  }

  // Build comparison chart: last 3 measurements (oldest first)
  const last3 = measurements.slice(0, 3).reverse()

  const comparisonData = MEASUREMENT_FIELDS.map(field => {
    const entry: Record<string, any> = { parte: field.shortLabel }
    let hasValue = false
    last3.forEach((m, i) => {
      const val = (m as any)[field.key]
      if (val !== undefined) { entry[`misura${i}`] = val; hasValue = true }
    })
    return hasValue ? entry : null
  }).filter(Boolean) as Record<string, any>[]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Ruler size={22} style={{ color: 'var(--accent)' }} />
            Misure Corporee
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Traccia le tue misure nel tempo
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Aggiungi
        </Button>
      </div>

      {/* Latest measurements grid */}
      {latestMeasurement ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Ultime Misure</p>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(latestMeasurement.date)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MEASUREMENT_FIELDS.map(field => {
              const val = (latestMeasurement as any)[field.key] as number | undefined
              if (!val) return null
              const prev = measurements[1] ? (measurements[1] as any)[field.key] as number | undefined : undefined
              const delta = prev !== undefined ? val - prev : undefined
              return (
                <div key={field.key as string} className="flex flex-col items-center gap-1 rounded-xl p-3"
                  style={{ background: 'var(--surface-2)', border: `1px solid ${field.color}33` }}>
                  <span className="text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>{field.label}</span>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: field.color }}>
                    {val.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>cm</span>
                  {delta !== undefined && (
                    <span className="text-xs font-medium" style={{ color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          {latestMeasurement.notes && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{latestMeasurement.notes}</p>
          )}
        </Card>
      ) : (
        <EmptyState icon={<Ruler size={24} />} title="Nessuna misura ancora" description="Aggiungi la prima misurazione" />
      )}

      {/* Comparison chart */}
      {last3.length >= 2 && comparisonData.length > 0 && (
        <ChartWrapper title="Confronto Ultime 3 Rilevazioni" height={300} empty={false}>
          <BarChart data={comparisonData} margin={{ top: 8, right: 8, bottom: 28, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="parte"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              angle={-35} textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${v}cm`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              formatter={(value) => <span style={{ color: 'var(--text-muted)' }}>{value}</span>}
            />
            {last3.map((m, i) => (
              <Bar
                key={i}
                dataKey={`misura${i}`}
                name={formatDate(m.date)}
                fill={CHART_COLORS[i]}
                fillOpacity={0.85}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            ))}
          </BarChart>
        </ChartWrapper>
      )}

      {/* History table */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Storico Misure</p>
        {measurements.length === 0 ? (
          <EmptyState icon="📏" title="Nessuna registrazione" description="Aggiungi la prima misurazione" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="pb-2 pr-3 text-left font-medium uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Data</th>
                  {MEASUREMENT_FIELDS.map(f => (
                    <th key={f.key as string} className="pb-2 pr-2 text-right font-medium uppercase tracking-wide whitespace-nowrap"
                      style={{ color: f.color }}>
                      {f.shortLabel}
                    </th>
                  ))}
                  <th className="pb-2 text-left font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {measurements.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-2.5 pr-3 font-medium whitespace-nowrap" style={{ color: 'var(--text)' }}>
                      {formatDate(m.date)}
                    </td>
                    {MEASUREMENT_FIELDS.map(f => {
                      const val = (m as any)[f.key] as number | undefined
                      return (
                        <td key={f.key as string} className="py-2.5 pr-2 text-right tabular-nums"
                          style={{ color: val !== undefined ? f.color : 'var(--border)' }}>
                          {val !== undefined ? val.toFixed(1) : '-'}
                        </td>
                      )
                    })}
                    <td className="py-2.5 max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {m.notes ?? '-'}
                    </td>
                    <td className="py-2.5 pl-2">
                      <Button size="icon" variant="ghost" onClick={() => m.id !== undefined && deleteMeasurement(m.id)}>
                        <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aggiungi Misure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Data *</label>
              <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Misure (cm) — compila solo quelle disponibili
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MEASUREMENT_FIELDS.map(field => (
                <div key={field.key as string} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: field.color }}>
                    {field.label}
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    step="0.1"
                    placeholder="cm"
                    value={formValues[field.key as string] ?? ''}
                    onChange={e => setFormValues(v => ({ ...v, [field.key as string]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
              <Textarea
                placeholder="Condizioni, ora del giorno, ecc..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
