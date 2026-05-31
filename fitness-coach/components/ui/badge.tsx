import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default:  { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' },
  success:  { background: 'color-mix(in srgb, var(--success) 20%, transparent)', color: 'var(--success)' },
  danger:   { background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' },
  warning:  { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' },
  outline:  { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
}

export function Badge({
  className,
  variant = 'default',
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      style={{ ...variantStyles[variant], ...style }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}
