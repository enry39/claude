'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/shared/StatCard'
import { ChartWrapper } from '@/components/shared/ChartWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Flame, Dumbbell, Scale, Moon, Footprints, BarChart2,
  Zap, Plus, TrendingUp, Trophy, ChevronRight, Activity,
} from 'lucide-react'
import { formatDate, formatDateShort, formatKg, formatCalories, formatDuration, clampPercent, dayNameShort } from '@/lib/utils'
import Link from 'next/link'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

function italianDate(): string {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function QualityStars({ score }: { score: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= score ? 'var(--accent)' : 'var(--border)', fontSize: '12px' }}>★</span>
      ))}
    </span>
  )
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = clampPercent(value, max)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--text)' }} className="font-medium tabular-nums">
          {Math.round(value)}g <span style={{ color: 'var(--text-muted)' }}>/ {max}g</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-muted)' }} className="mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.value?.toFixed(1)} kg
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const {
    todayMacros, macroTargets, latestWeight, todaySleep,
    todaySteps, weekSessions, recentSessions, recentPRs, last7WeightEntries, streak,
  } = useDashboard()

  const calTarget = macroTargets?.calories ?? 2500
  const protTarget = macroTargets?.proteinG ?? 180
  const carbTarget = macroTargets?.carbsG ?? 250
  const fatTarget = macroTargets?.fatG ?? 80
  const weekTarget = 5

  const chartData = last7WeightEntries.map(e => ({
    date: dayNameShort(e.date),
    peso: e.weightKg,
  }))

  const sleepH = todaySleep ? (todaySleep.durationMinutes / 60).toFixed(1) : '--'
  const sleepQ = todaySleep?.qualityScore ?? 0

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {greeting()}, Coach
            </h1>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                🔥 {streak} {streak === 1 ? 'giorno' : 'giorni'}
              </span>
            )}
          </div>
          <p className="text-sm capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {italianDate()}
          </p>
        </div>
        {/* Quick actions */}
        <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
          <Link href="/nutrizione">
            <Button size="sm" variant="outline">
              <Plus size={14} /> Pasto
            </Button>
          </Link>
          <Link href="/corpo/peso">
            <Button size="sm" variant="outline">
              <Plus size={14} /> Peso
            </Button>
          </Link>
          <Link href="/allenamento">
            <Button size="sm">
              <Plus size={14} /> Sessione
            </Button>
          </Link>
          <Link href="/sonno">
            <Button size="sm" variant="outline">
              <Plus size={14} /> Sonno
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <StatCard
            label="Calorie Oggi"
            value={Math.round(todayMacros.calories)}
            unit="kcal"
            icon={<Flame size={16} />}
            color="var(--accent)"
            subtext={`/ ${calTarget} kcal`}
            trendValue={`${clampPercent(todayMacros.calories, calTarget)}%`}
            trend={todayMacros.calories >= calTarget ? 'up' : 'neutral'}
          />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <StatCard
            label="Proteine Oggi"
            value={Math.round(todayMacros.proteinG)}
            unit="g"
            icon={<Zap size={16} />}
            color="var(--primary)"
            subtext={`/ ${protTarget}g target`}
            trendValue={`${clampPercent(todayMacros.proteinG, protTarget)}%`}
            trend={todayMacros.proteinG >= protTarget ? 'up' : 'neutral'}
          />
        </div>
        <StatCard
          label="Peso"
          value={latestWeight ? formatKg(latestWeight) : '--'}
          icon={<Scale size={16} />}
          color="var(--secondary)"
          subtext="ultimo rilevato"
        />
        <div className="col-span-1">
          <div className="rounded-xl border p-4 flex flex-col gap-2 h-full"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Sonno</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{sleepH}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>ore</span>
            </div>
            {sleepQ > 0 && <QualityStars score={sleepQ} />}
            {!todaySleep && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Nessun dato</span>}
          </div>
        </div>
        <StatCard
          label="Passi"
          value={todaySteps?.steps.toLocaleString('it-IT') ?? '--'}
          icon={<Footprints size={16} />}
          color="var(--success)"
          subtext="oggi"
          trendValue={todaySteps ? `${clampPercent(todaySteps.steps, 10000)}%` : undefined}
          trend={todaySteps && todaySteps.steps >= 10000 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Sessioni Settimana"
          value={`${weekSessions.length}/${weekTarget}`}
          icon={<Dumbbell size={16} />}
          color="var(--danger)"
          subtext="questa settimana"
          trend={weekSessions.length >= weekTarget ? 'up' : 'neutral'}
          trendValue={weekSessions.length >= weekTarget ? 'Target!' : undefined}
        />
      </div>

      {/* Macros today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Macros Oggi</p>
            <Link href="/nutrizione">
              <Button size="sm" variant="ghost">
                <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Calorie</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                {Math.round(todayMacros.calories)} / {calTarget} kcal
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${clampPercent(todayMacros.calories, calTarget)}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--danger))',
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <MacroBar label="Proteine" value={todayMacros.proteinG} max={protTarget} color="var(--primary)" />
            <MacroBar label="Carboidrati" value={todayMacros.carbsG} max={carbTarget} color="var(--secondary)" />
            <MacroBar label="Grassi" value={todayMacros.fatG} max={fatTarget} color="var(--accent)" />
          </div>
        </Card>

        {/* Weight chart */}
        <ChartWrapper
          title="Peso Ultimi 7 Giorni"
          height={220}
          empty={chartData.length === 0}
          className="lg:col-span-2"
        >
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={v => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="peso"
              stroke="var(--secondary)"
              strokeWidth={2}
              fill="url(#weightGrad)"
              dot={{ fill: 'var(--secondary)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'var(--secondary)' }}
            />
          </AreaChart>
        </ChartWrapper>
      </div>

      {/* Recent sessions + PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              <Activity size={15} className="inline mr-1.5 mb-0.5" style={{ color: 'var(--primary)' }} />
              Sessioni Recenti
            </p>
            <Link href="/allenamento/storico">
              <Button size="sm" variant="ghost" className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Vedi tutto <ChevronRight size={12} />
              </Button>
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <EmptyState icon={<Dumbbell size={22} />} title="Nessuna sessione ancora" description="Inizia il tuo primo allenamento!" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{s.workoutDayName}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(s.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--primary)' }}>
                      {s.totalVolumeKg.toLocaleString('it-IT')} kg
                    </span>
                    {s.endTime && s.startTime && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDuration(Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              <Trophy size={15} className="inline mr-1.5 mb-0.5" style={{ color: 'var(--accent)' }} />
              Ultimi Personal Record
            </p>
            <Link href="/allenamento/record">
              <Button size="sm" variant="ghost" className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Vedi tutto <ChevronRight size={12} />
              </Button>
            </Link>
          </div>
          {recentPRs.length === 0 ? (
            <EmptyState icon={<Trophy size={22} />} title="Nessun PR ancora" description="Allenati duro per battere i tuoi record!" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentPRs.map(pr => (
                <div key={pr.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs rounded-md px-2 py-0.5 font-medium shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                      {pr.type === '1rm' ? '1RM' : pr.type === 'volume' ? 'VOL' : 'REPS'}
                    </span>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      Ex #{pr.exerciseId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--success)' }}>
                      {pr.value.toFixed(1)}{pr.type === 'reps_at_weight' ? ' reps' : ' kg'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateShort(pr.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
