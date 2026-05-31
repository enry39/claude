'use client'
import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          ...style,
        }}
        className={cn(
          'w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'resize-y transition-colors',
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'
