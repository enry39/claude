'use client'

import { useState } from 'react'
import { useStepsLog } from '@/hooks/useStepsLog'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell,
} from 'recharts'
import { Footprints, Plus, Trash2, Flame, MapPin, Target } from 'lucide-react'
import { formatDate, today, dayNameShort, clampPercent } from '@/lib/utils'

const STEPS_GOAL = 10000

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.fill }}>
          {p.name}: {p.value?.toLocaleString('it-IT')}
        </p>
      ))}
    </div>
  )
}

export default function PassiPage() {
  const { entries, addEntry, deleteEntry, todayEntry, last7Days, weeklyTotal, weeklyAverage } = useStepsLog()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: today(),
    steps: '',
    activeCalories: '',
    distanceKm: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const steps = parseInt(form.steps)
    if (!form.date || isNaN(steps)) return
    await addEntry({
      date: form.date,
      steps,
      activeCalories: form.activeCalories ? parseFloat(form.activeCalories) : undefined,
      distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : undefined,
      notes: form.notes || undefined,
    })
    setOpen(false)
    setForm({ date: today(), steps: '', activeCalories: '', distanceKm: '', notes: '' })
  }

  const stepsToday = todayEntry?.steps ?? 0
  const pct = clampPercent(stepsToday, STEPS_GOAL)

  // Chart: last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const entry = last7Days.find(e => e.date === dateStr)
    return {
      date: dayNameShort(dateStr),
      passi: entry?.steps ?? 0,
      raw: dateStr,
    }
  })

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Footprints size={22} style={{ color: 'var(--success)' }} />
            Passi & Attività
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Monitora la tua attività quotidiana</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Aggiungi
        </Button>
      </div>

      {/* Today card + stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today big card */}
        <Card className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Passi Oggi</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold tabular-nums" style={{ color: stepsToday >= STEPS_GOAL ? 'var(--success)' : 'var(--text)' }}>
                  {stepsToday.toLocaleString('it-IT')}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Obiettivo: {STEPS_GOAL.toLocaleString('it-IT')} passi
              </p>
            </div>
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={stepsToday >= STEPS_GOAL ? 'var(--success)' : 'var(--primary)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: stepsToday >= STEPS_GOAL ? 'var(--success)' : 'var(--text)' }}>
                  {pct}%
                </span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: stepsToday >= STEPS_GOAL
                  ? 'linear-gradient(90deg, var(--success), #34d399)'
                  : 'linear-gradient(90deg, var(--primary), var(--secondary))',
              }}
            />
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            {todayEntry?.activeCalories && (
              <span className="flex items-center gap-1.5">
                <Flame size={14} style={{ color: 'var(--accent)' }} />
                {todayEntry.activeCalories} kcal attive
              </span>
            )}
            {todayEntry?.distanceKm && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                {todayEntry.distanceKm.toFixed(2)} km
              </span>
            )}
          </div>
        </Card>

        {/* Weekly stats */}
        <Card className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Totale Settimana</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: 'var(--primary)' }}>
              {weeklyTotal.toLocaleString('it-IT')}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>passi totali (7 giorni)</p>
          <div className="pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Pari a ~{((weeklyTotal * 0.75) / 1000).toFixed(1)} km
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Media Giornaliera</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums"
              style={{ color: weeklyAverage >= STEPS_GOAL ? 'var(--success)' : 'var(--text)' }}>
              {weeklyAverage.toLocaleString('it-IT')}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>passi/giorno (7 giorni)</p>
          <div className="flex items-center gap-1.5 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <Target size={12} style={{ color: weeklyAverage >= STEPS_GOAL ? 'var(--success)' : 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: weeklyAverage >= STEPS_GOAL ? 'var(--success)' : 'var(--text-muted)' }}>
              {weeklyAverage >= STEPS_GOAL ? 'Obiettivo raggiunto!' : `Mancano ${(STEPS_GOAL - weeklyAverage).toLocaleString('it-IT')}`}
            </p>
          </div>
        </Card>
      </div>

      {/* Bar chart */}
      <ChartWrapper title="Passi Ultimi 7 Giorni" height={250} empty={entries.length === 0}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={STEPS_GOAL}
            stroke="var(--success)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: '10k', fill: 'var(--success)', fontSize: 10, position: 'right' }}
          />
          <Bar dataKey="passi" name="Passi" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.passi >= STEPS_GOAL ? 'var(--success)' : 'var(--primary)'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>

      {/* Log table */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Storico Passi</p>
        {entries.length === 0 ? (
          <EmptyState icon="👣" title="Nessuna registrazione" description="Aggiungi i tuoi passi per monitorare l'attività." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Passi', 'Calorie Attive', 'Distanza', 'Note', ''].map(h => (
                    <th key={h} className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text)' }}>{formatDate(e.date)}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-bold tabular-nums"
                        style={{ color: e.steps >= STEPS_GOAL ? 'var(--success)' : 'var(--text)' }}>
                        {e.steps.toLocaleString('it-IT')}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {e.activeCalories ? `${e.activeCalories} kcal` : '-'}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {e.distanceKm ? `${e.distanceKm.toFixed(2)} km` : '-'}
                    </td>
                    <td className="py-2.5 pr-4 max-w-[180px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {e.notes ?? '-'}
                    </td>
                    <td className="py-2.5">
                      <Button size="icon" variant="ghost" onClick={() => e.id !== undefined && deleteEntry(e.id)}>
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Passi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Data</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Passi *</label>
              <Input
                type="number" min="0" max="100000"
                placeholder="es. 8500"
                value={form.steps}
                onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Calorie Attive (kcal)</label>
                <Input
                  type="number" min="0"
                  placeholder="es. 350"
                  value={form.activeCalories}
                  onChange={e => setForm(f => ({ ...f, activeCalories: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Distanza (km)</label>
                <Input
                  type="number" min="0" step="0.01"
                  placeholder="es. 6.2"
                  value={form.distanceKm}
                  onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
              <Textarea
                placeholder="Passeggiata, corsa, escursione..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
