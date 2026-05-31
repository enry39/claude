import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  subtext?: string
  icon?: ReactNode
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

const trendConfig = {
  up: { icon: TrendingUp, color: 'var(--success)', label: 'up' },
  down: { icon: TrendingDown, color: 'var(--danger)', label: 'down' },
  neutral: { icon: Minus, color: 'var(--text-muted)', label: 'neutral' },
}

export function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  color,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null
  const trendColor = trend ? trendConfig[trend].color : undefined

  return (
    <div
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      className={cn('rounded-xl border p-4 flex flex-col gap-2', className)}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        {icon && (
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{
              background: color
                ? `color-mix(in srgb, ${color} 15%, transparent)`
                : 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: color ?? 'var(--primary)',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-2xl font-bold leading-none"
          style={{ color: color ?? 'var(--text)' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Footer: subtext and/or trend */}
      {(subtext || (trend && trendValue)) && (
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          {subtext && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {subtext}
            </span>
          )}
          {trend && trendValue && TrendIcon && (
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: trendColor }}
            >
              <TrendIcon size={13} />
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
