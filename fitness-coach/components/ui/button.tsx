'use client'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default:
    'text-white font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity',
  outline:
    'bg-transparent border text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors',
  ghost:
    'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors',
  danger:
    'text-white font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity',
  success:
    'text-white font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity',
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: { background: 'var(--primary)' },
  outline: { borderColor: 'var(--border)' },
  ghost: {},
  danger: { background: 'var(--danger)' },
  success: { background: 'var(--success)' },
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
  icon: 'h-9 w-9 p-0 rounded-lg flex items-center justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      children,
      style,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{ ...variantStyles[variant], ...style }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
