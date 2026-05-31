import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode | string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-1"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-muted)',
          }}
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-sm max-w-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
