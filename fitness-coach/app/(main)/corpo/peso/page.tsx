'use client'

import { useState } from 'react'
import { useWeightLog } from '@/hooks/useWeightLog'
import { useSettings } from '@/hooks/useSettings'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart,
} from 'recharts'
import { Scale, Plus, Trash2, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { formatDate, formatDateShort, today } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color ?? p.stroke }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name === 'BF%' ? '%' : ' kg'}
        </p>
      ))}
    </div>
  )
}

export default function PesoPage() {
  const { entries, addEntry, deleteEntry, latestWeight, last30Days, movingAverage7d } = useWeightLog()
  const { profile } = useSettings()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: today(),
    weightKg: '',
    bodyFatPct: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(form.weightKg)
    if (!form.date || isNaN(w)) return
    await addEntry({
      date: form.date,
      weightKg: w,
      bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : undefined,
      notes: form.notes || undefined,
    })
    setOpen(false)
    setForm({ date: today(), weightKg: '', bodyFatPct: '', notes: '' })
  }

  const targetWeight = profile.targetWeightKg
  const diff = latestWeight !== undefined ? latestWeight - targetWeight : undefined
  const hasBF = entries.some(e => e.bodyFatPct !== undefined)

  // Chart data: merge last30Days with movingAverage7d
  const chartData = movingAverage7d.map(p => ({
    date: formatDateShort(p.date),
    peso: p.weightKg,
    media7d: p.movingAvg,
    bf: entries.find(e => e.date === p.date)?.bodyFatPct,
  }))

  // Weight trend
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (last30Days.length >= 4) {
    const first = last30Days.slice(0, 2).reduce((s, e) => s + e.weightKg, 0) / 2
    const last = last30Days.slice(-2).reduce((s, e) => s + e.weightKg, 0) / 2
    if (last - first > 0.5) trend = 'up'
    else if (first - last > 0.5) trend = 'down'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Scale size={22} style={{ color: 'var(--secondary)' }} />
            Peso Corporeo
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Traccia il tuo peso nel tempo
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Aggiungi
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Peso Attuale</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold" style={{ color: 'var(--secondary)' }}>
              {latestWeight !== undefined ? latestWeight.toFixed(1) : '--'}
            </span>
            <span className="text-lg" style={{ color: 'var(--text-muted)' }}>kg</span>
          </div>
          {entries.length > 0 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Ultima: {formatDateShort(entries[0].date)}
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Peso Obiettivo</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
              {targetWeight.toFixed(1)}
            </span>
            <span className="text-lg" style={{ color: 'var(--text-muted)' }}>kg</span>
          </div>
          {diff !== undefined && (
            <p className="text-xs" style={{ color: Math.abs(diff) < 0.5 ? 'var(--success)' : 'var(--text-muted)' }}>
              {Math.abs(diff) < 0.5 ? 'Obiettivo raggiunto!' : `${Math.abs(diff).toFixed(1)} kg ${diff > 0 ? 'sopra' : 'sotto'}`}
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Trend (30gg)</p>
          <div className="flex items-center gap-2">
            <TrendIcon size={28} style={{ color: trendColor }} />
            <span className="text-2xl font-bold" style={{ color: trendColor }}>
              {trend === 'up' ? 'Salita' : trend === 'down' ? 'Discesa' : 'Stabile'}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {last30Days.length} rilevazioni/30gg
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>BF% Attuale</p>
          {hasBF ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                  {entries.find(e => e.bodyFatPct !== undefined)?.bodyFatPct?.toFixed(1) ?? '--'}
                </span>
                <span className="text-lg" style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ultimo rilevato</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-muted)' }}>--</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nessun dato</p>
            </>
          )}
        </Card>
      </div>

      {/* Progress toward goal */}
      {latestWeight !== undefined && diff !== undefined && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              <Target size={14} className="inline mr-1.5 mb-0.5" style={{ color: 'var(--primary)' }} />
              Progresso verso l&apos;obiettivo
            </p>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {latestWeight.toFixed(1)} kg → {targetWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.abs(diff) < 0.5 ? 100 : Math.max(5, 100 - Math.min(100, Math.abs(diff) * 5)))}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {diff > 0.5 ? `Devi perdere ${diff.toFixed(1)} kg` :
              diff < -0.5 ? `Devi guadagnare ${Math.abs(diff).toFixed(1)} kg` :
              'Sei al peso obiettivo!'}
          </p>
        </Card>
      )}

      {/* Chart */}
      <ChartWrapper title="Peso & Media Mobile 7 Giorni (30gg)" height={280} empty={chartData.length === 0}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false} tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            tickFormatter={v => `${v}kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value) => <span style={{ color: 'var(--text-muted)' }}>{value}</span>}
          />
          <Area
            type="monotone" dataKey="peso" name="Peso"
            stroke="var(--secondary)" strokeWidth={1.5}
            fill="url(#weightAreaGrad)"
            dot={{ fill: 'var(--secondary)', strokeWidth: 0, r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone" dataKey="media7d" name="Media 7gg"
            stroke="var(--primary)" strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)' }}
          />
        </ComposedChart>
      </ChartWrapper>

      {/* BF% chart if data */}
      {hasBF && (
        <ChartWrapper title="% Grasso Corporeo" height={200} empty={false}>
          <AreaChart data={chartData.filter(d => d.bf !== undefined)} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="bf" name="BF%"
              stroke="var(--accent)" strokeWidth={2}
              fill="url(#bfGrad)"
              dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
            />
          </AreaChart>
        </ChartWrapper>
      )}

      {/* Log table */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Storico Peso</p>
        {entries.length === 0 ? (
          <EmptyState icon={<Scale size={24} />} title="Nessuna registrazione" description="Aggiungi il tuo peso per iniziare" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Peso', 'BF%', 'Note', ''].map(h => (
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
                      <span className="font-bold tabular-nums" style={{ color: 'var(--secondary)' }}>
                        {e.weightKg.toFixed(1)} kg
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {e.bodyFatPct ? `${e.bodyFatPct.toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 pr-4 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {e.notes ?? '-'}
                    </td>
                    <td className="py-2.5">
                      <Button size="icon" variant="ghost" onClick={() => e.id !== undefined && deleteEntry(e.id)}>
                        <Trash2 size={13} style={{ color: 'var(--danger)' }} />
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
            <DialogTitle>Aggiungi Peso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Data *</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Peso (kg) *</label>
                <Input
                  type="number" min="30" max="300" step="0.1"
                  placeholder="es. 85.5"
                  value={form.weightKg}
                  onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                  required autoFocus
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Grasso Corporeo % (opzionale)</label>
              <Input
                type="number" min="1" max="60" step="0.1"
                placeholder="es. 15.5"
                value={form.bodyFatPct}
                onChange={e => setForm(f => ({ ...f, bodyFatPct: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Note (opzionale)</label>
              <Textarea
                placeholder="Condizioni particolari, refeed, ecc..."
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
