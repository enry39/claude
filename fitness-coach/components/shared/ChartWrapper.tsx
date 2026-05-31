import { cn } from '@/lib/utils'
import { ResponsiveContainer } from 'recharts'
import { EmptyState } from './EmptyState'
import type { ReactNode } from 'react'

interface ChartWrapperProps {
  title?: string
  height?: number
  children: ReactNode
  loading?: boolean
  empty?: boolean
  className?: string
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{ width, height: '100%', background: 'var(--surface-2)' }}
    />
  )
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full flex items-end gap-2 px-2 pb-2"
      style={{ height }}
    >
      {['40%', '65%', '50%', '80%', '55%', '70%', '45%', '90%', '60%', '75%'].map(
        (h, i) => (
          <div key={i} className="flex-1" style={{ height: h }}>
            <SkeletonBar width="100%" />
          </div>
        ),
      )}
    </div>
  )
}

export function ChartWrapper({
  title,
  height = 300,
  children,
  loading = false,
  empty = false,
  className,
}: ChartWrapperProps) {
  return (
    <div
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      className={cn('rounded-xl border p-4', className)}
    >
      {title && (
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </p>
      )}

      {loading ? (
        <ChartSkeleton height={height} />
      ) : empty ? (
        <div style={{ height }}>
          <EmptyState
            icon="📊"
            title="No data yet"
            description="Log some entries to see your chart here."
            className="h-full"
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {/* Children must be a single Recharts chart element */}
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  )
}
