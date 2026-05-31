'use client'
import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

interface ProgressProps extends ComponentPropsWithoutRef<typeof RadixProgress.Root> {
  value?: number
  color?: string
}

export const Progress = forwardRef<
  ElementRef<typeof RadixProgress.Root>,
  ProgressProps
>(({ className, value = 0, color, style, ...props }, ref) => {
  const clampedValue = Math.min(100, Math.max(0, value))
  const fillColor = color ?? 'var(--primary)'

  return (
    <RadixProgress.Root
      ref={ref}
      value={clampedValue}
      style={{ background: 'var(--surface-2)', ...style }}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <RadixProgress.Indicator
        style={{
          background: fillColor,
          transform: `translateX(-${100 - clampedValue}%)`,
        }}
        className="h-full w-full flex-1 transition-transform duration-500 ease-in-out rounded-full"
      />
    </RadixProgress.Root>
  )
})
Progress.displayName = RadixProgress.Root.displayName
