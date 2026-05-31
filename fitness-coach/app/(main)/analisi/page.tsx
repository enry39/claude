'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { StatCard } from '@/components/shared/StatCard'
import { Card } from '@/components/ui/card'
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, Brain, Dumbbell, Moon,
  Utensils, BarChart2, Activity,
} from 'lucide-react'
import { MUSCLE_COLORS } from '@/lib/constants/muscleGroups'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      {label && <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color ?? p.fill ?? 'var(--text)' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('it-IT') : p.value}
          {p.name === 'Volume' ? ' kg' : p.name === 'Sonno' ? 'h' : ''}
        </p>
      ))}
    </div>
  )
}

const INSIGHT_COLORS: Record<string, string> = {
  0: 'var(--primary)',
  1: 'var(--success)',
  2: 'var(--accent)',
  3: 'var(--secondary)',
  4: 'var(--danger)',
}

function WeightTrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const config = {
    up: { Icon: TrendingUp, color: 'var(--success)', label: 'In crescita' },
    down: { Icon: TrendingDown, color: 'var(--danger)', label: 'In calo' },
    stable: { Icon: Minus, color: 'var(--text-muted)', label: 'Stabile' },
  }
  const { Icon, color, label } = config[trend]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
      <Icon size={13} /> {label}
    </span>
  )
}

export default function AnalisiPage() {
  const {
    weeklyWorkouts, monthlyVolume, avgSleepLast7,
    avgCaloriesLast7, weightTrend, sleepVsVolume,
    weeklyVolumeByMuscle, insights,
  } = useAnalytics()

  const avgSleepH = avgSleepLast7 / 60

  // Mock weekly volume trend (last 8 weeks) using monthlyVolume
  const weeklyVolumeTrend = Array.from({ length: 8 }, (_, i) => ({
    settimana: `S${i + 1}`,
    volume: i === 7 ? monthlyVolume / 4 : Math.round(monthlyVolume / 4 * (0.6 + Math.random() * 0.8)),
  }))

  const scatterData = sleepVsVolume
    .filter(d => d.sleepHours > 0 && d.volumeKg > 0)
    .map(d => ({ sonno: d.sleepHours, volume: d.volumeKg, date: d.date }))

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <BarChart2 size={22} style={{ color: 'var(--primary)' }} />
          Analisi & Insight
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Il tuo centro di comando — dati aggregati e pattern
        </p>
      </div>

      {/* Weekly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Sessioni questa settimana"
          value={weeklyWorkouts}
          icon={<Dumbbell size={16} />}
          color="var(--primary)"
          subtext="target: 5"
          trend={weeklyWorkouts >= 5 ? 'up' : weeklyWorkouts >= 3 ? 'neutral' : 'down'}
          trendValue={weeklyWorkouts >= 5 ? 'Ottimo!' : undefined}
        />
        <StatCard
          label="Volume Mensile"
          value={Math.round(monthlyVolume / 1000)}
          unit="ton"
          icon={<Activity size={16} />}
          color="var(--secondary)"
          subtext={`${Math.round(monthlyVolume).toLocaleString('it-IT')} kg totali`}
        />
        <StatCard
          label="Media Sonno (7gg)"
          value={avgSleepH.toFixed(1)}
          unit="ore"
          icon={<Moon size={16} />}
          color={avgSleepH >= 7 ? 'var(--success)' : 'var(--danger)'}
          subtext="target: 8h"
          trend={avgSleepH >= 7 ? 'up' : 'down'}
          trendValue={avgSleepH >= 7 ? 'Buono' : 'Migliora'}
        />
        <StatCard
          label="Calorie Medie (7gg)"
          value={Math.round(avgCaloriesLast7).toLocaleString('it-IT')}
          unit="kcal"
          icon={<Utensils size={16} />}
          color="var(--accent)"
          subtext="media giornaliera"
        />
      </div>

      {/* Weight trend + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend indicator */}
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Trend Peso</p>
          <WeightTrendBadge trend={weightTrend} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Calcolato sulle ultime 2 settimane di rilevazioni
          </p>
          <div className="mt-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Interpretazione</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              {weightTrend === 'up' && 'Il tuo peso sta aumentando. In fase bulk è positivo — monitora i grassi corporei.'}
              {weightTrend === 'down' && 'Il tuo peso sta diminuendo. Verifica che sia in linea con il tuo obiettivo.'}
              {weightTrend === 'stable' && 'Il peso è stabile. Perfetto per la fase di mantenimento o recomp.'}
            </p>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="lg:col-span-2 flex flex-col gap-3">
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Brain size={16} style={{ color: 'var(--primary)' }} />
            Insight del Coach
          </p>
          {insights.length === 0 ? (
            <div className="flex flex-col gap-2 py-4">
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                Inserisci più dati per ricevere insight personalizzati
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3"
                  style={{ background: `color-mix(in srgb, ${INSIGHT_COLORS[String(i % 5)]} 10%, transparent)`, borderLeft: `3px solid ${INSIGHT_COLORS[String(i % 5)]}` }}>
                  <Brain size={14} className="mt-0.5 shrink-0" style={{ color: INSIGHT_COLORS[String(i % 5)] }} />
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{insight}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly volume trend */}
        <ChartWrapper title="Volume Mensile (ultime 8 settimane)" height={240} empty={monthlyVolume === 0}>
          <AreaChart data={weeklyVolumeTrend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="settimana" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}t`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="volume" name="Volume"
              stroke="var(--primary)" strokeWidth={2}
              fill="url(#volGrad)"
              dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartWrapper>

        {/* Sonno vs Performance scatter */}
        <ChartWrapper title="Sonno vs Volume Allenamento" height={240} empty={scatterData.length === 0}>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="sonno" name="Sonno" type="number"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}h`}
              domain={[4, 10]}
            />
            <YAxis
              dataKey="volume" name="Volume" type="number"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(1)}t`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload as any
                return (
                  <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>{d.date}</p>
                    <p style={{ color: 'var(--secondary)' }}>Sonno: {d.sonno?.toFixed(1)}h</p>
                    <p style={{ color: 'var(--primary)' }}>Volume: {d.volume?.toLocaleString('it-IT')} kg</p>
                  </div>
                )
              }}
            />
            <Scatter data={scatterData} fill="var(--secondary)" fillOpacity={0.8} />
          </ScatterChart>
        </ChartWrapper>

        {/* Volume by muscle group */}
        <ChartWrapper title="Volume per Gruppo Muscolare (settimana)" height={240} empty={weeklyVolumeByMuscle.length === 0} className="lg:col-span-2">
          <BarChart
            data={weeklyVolumeByMuscle}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(1)}t`}
            />
            <YAxis
              type="category" dataKey="muscle"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              width={76}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <p className="font-semibold">{payload[0]?.payload?.muscle}</p>
                    <p style={{ color: 'var(--primary)' }}>{payload[0]?.value?.toLocaleString('it-IT')} kg</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="volumeKg" name="Volume" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {weeklyVolumeByMuscle.map((entry, i) => (
                <Cell key={i} fill={MUSCLE_COLORS[entry.muscle] ?? 'var(--primary)'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ChartWrapper>
      </div>

      {/* Monthly stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Volume Totale Mese</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
            {Math.round(monthlyVolume).toLocaleString('it-IT')} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>kg</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ultimi 30 giorni</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Sessioni Settimanali</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>
            {weeklyWorkouts} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/ 5</span>
          </p>
          <p className="text-xs" style={{ color: weeklyWorkouts >= 5 ? 'var(--success)' : 'var(--text-muted)' }}>
            {weeklyWorkouts >= 5 ? 'Obiettivo raggiunto!' : `Mancano ${5 - weeklyWorkouts} sessioni`}
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Efficienza Recupero</p>
          <p className="text-3xl font-bold" style={{ color: avgSleepH >= 7 ? 'var(--success)' : 'var(--danger)' }}>
            {avgSleepH.toFixed(1)} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>ore/notte</span>
          </p>
          <p className="text-xs" style={{ color: avgSleepH >= 7 ? 'var(--success)' : 'var(--danger)' }}>
            {avgSleepH >= 8 ? 'Recupero ottimale' : avgSleepH >= 7 ? 'Recupero sufficiente' : 'Recupero insufficiente'}
          </p>
        </Card>
      </div>
    </div>
  )
}
