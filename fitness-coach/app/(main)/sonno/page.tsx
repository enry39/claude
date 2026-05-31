'use client'

import { useState } from 'react'
import { useSleepLog } from '@/hooks/useSleepLog'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { Moon, Plus, Trash2, Clock, Star } from 'lucide-react'
import { formatDate, formatDateShort, today, dayNameShort } from '@/lib/utils'
import type { SleepEntry } from '@/types'

function QualityStars({ score, interactive = false, onChange }: { score: number; interactive?: boolean; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange?.(i)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          style={{ color: i <= score ? 'var(--accent)' : 'var(--border)', fontSize: '18px', background: 'none', border: 'none', padding: 0 }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function calcDuration(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 0
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins < 0) mins += 24 * 60
  return mins
}

const BAR_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#34d399']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value?.toFixed?.(p.name === 'Qualità' ? 1 : 2) ?? p.value}
          {p.name === 'Durata' ? 'h' : ''}
        </p>
      ))}
    </div>
  )
}

export default function SonnoPage() {
  const { entries, addEntry, deleteEntry, last7Days, last30Days, averageDuration, averageQuality } = useSleepLog()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: today(),
    bedtime: '23:00',
    wakeTime: '07:00',
    qualityScore: 4,
    notes: '',
  })

  const duration = calcDuration(form.bedtime, form.wakeTime)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || !form.bedtime || !form.wakeTime) return
    await addEntry({
      date: form.date,
      bedtime: form.bedtime,
      wakeTime: form.wakeTime,
      durationMinutes: duration,
      qualityScore: form.qualityScore,
      notes: form.notes || undefined,
    })
    setOpen(false)
    setForm({ date: today(), bedtime: '23:00', wakeTime: '07:00', qualityScore: 4, notes: '' })
  }

  const todayEntry = entries.find(e => e.date === today())

  // Build last 14 days chart data
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateStr)
    return {
      date: dayNameShort(dateStr),
      durata: entry ? entry.durationMinutes / 60 : null,
      qualita: entry ? entry.qualityScore : null,
      raw: dateStr,
    }
  })

  const avgH = averageDuration / 60

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Moon size={22} style={{ color: 'var(--primary)' }} />
            Sonno
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Traccia il tuo recupero notturno</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Aggiungi
        </Button>
      </div>

      {/* Today + summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today card */}
        <Card className="flex flex-col gap-3 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Stanotte</p>
          {todayEntry ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                  {(todayEntry.durationMinutes / 60).toFixed(1)}
                </span>
                <span className="text-lg" style={{ color: 'var(--text-muted)' }}>ore</span>
              </div>
              <QualityStars score={todayEntry.qualityScore} />
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {todayEntry.bedtime}
                </span>
                <span>→</span>
                <span>{todayEntry.wakeTime}</span>
              </div>
              {todayEntry.notes && (
                <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{todayEntry.notes}</p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <Moon size={28} style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nessun dato per stanotte</p>
              <Button size="sm" onClick={() => setOpen(true)}>Aggiungi</Button>
            </div>
          )}
        </Card>

        {/* Avg duration */}
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Media Durata (7gg)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: avgH >= 7 ? 'var(--success)' : 'var(--danger)' }}>
              {avgH.toFixed(1)}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>ore / notte</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, (avgH / 9) * 100).toFixed(0)}%`,
                background: avgH >= 7 ? 'var(--success)' : 'var(--danger)',
              }} />
            </div>
            <span>9h max</span>
          </div>
          <p className="text-xs" style={{ color: avgH >= 7 ? 'var(--success)' : 'var(--danger)' }}>
            {avgH >= 8 ? 'Ottimo recupero!' : avgH >= 7 ? 'Buono' : 'Migliora il sonno'}
          </p>
        </Card>

        {/* Avg quality */}
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Media Qualità (7gg)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
              {averageQuality.toFixed(1)}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/ 5</span>
          </div>
          <QualityStars score={Math.round(averageQuality)} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Basato su {last7Days.length} rilevazioni
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartWrapper title="Durata Sonno (14 notti)" height={220} empty={entries.length === 0}>
          <BarChart data={last14} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              domain={[0, 10]}
              tickFormatter={v => `${v}h`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={8} stroke="var(--success)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '8h', fill: 'var(--success)', fontSize: 10 }} />
            <Bar dataKey="durata" name="Durata" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {last14.map((entry, i) => (
                <Cell key={i} fill={entry.durata && entry.durata >= 7 ? 'var(--primary)' : 'var(--danger)'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ChartWrapper>

        <ChartWrapper title="Qualità del Sonno (14 notti)" height={220} empty={entries.length === 0}>
          <LineChart data={last14} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={4} stroke="var(--success)" strokeDasharray="4 4" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="qualita"
              name="Qualità"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ChartWrapper>
      </div>

      {/* Log table */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Storico Sonno</p>
        {entries.length === 0 ? (
          <EmptyState icon="🌙" title="Nessuna registrazione" description="Aggiungi il tuo sonno per monitorare il recupero." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Coricato', 'Sveglia', 'Durata', 'Qualità', 'Note', ''].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text)' }}>{formatDate(e.date)}</td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--text-muted)' }}>{e.bedtime}</td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--text-muted)' }}>{e.wakeTime}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold tabular-nums" style={{ color: e.durationMinutes >= 420 ? 'var(--success)' : 'var(--danger)' }}>
                        {durationLabel(e.durationMinutes)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <QualityStars score={e.qualityScore} />
                    </td>
                    <td className="py-2.5 pr-4 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>
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

      {/* Add sleep modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Sonno</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Data</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Durata: {duration > 0 ? durationLabel(duration) : '--'}
                </label>
                <div className="h-10 flex items-center px-3 rounded-lg text-sm"
                  style={{ background: 'var(--surface-2)', color: duration >= 420 ? 'var(--success)' : 'var(--danger)' }}>
                  {duration > 0 ? durationLabel(duration) : 'Seleziona orari'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Coricato</label>
                <Input type="time" value={form.bedtime} onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sveglia</label>
                <Input type="time" value={form.wakeTime} onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Qualità del sonno</label>
              <QualityStars score={form.qualityScore} interactive onChange={v => setForm(f => ({ ...f, qualityScore: v }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
              <Textarea
                placeholder="Come ti sei sentito? Sogni vividi, stress..."
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
