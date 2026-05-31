'use client'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

export const Select = RadixSelect.Root
export const SelectValue = RadixSelect.Value

export const SelectTrigger = forwardRef<
  ElementRef<typeof RadixSelect.Trigger>,
  ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    style={{
      background: 'var(--surface-2)',
      borderColor: 'var(--border)',
      color: 'var(--text)',
    }}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm',
      'placeholder:text-[var(--text-muted)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      'transition-colors [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon asChild>
      <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0 ml-1" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
))
SelectTrigger.displayName = RadixSelect.Trigger.displayName

export const SelectContent = forwardRef<
  ElementRef<typeof RadixSelect.Content>,
  ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      position={position}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-xl border shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className,
      )}
      {...props}
    >
      <RadixSelect.ScrollUpButton
        className="flex items-center justify-center py-1"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronUp size={14} />
      </RadixSelect.ScrollUpButton>

      <RadixSelect.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </RadixSelect.Viewport>

      <RadixSelect.ScrollDownButton
        className="flex items-center justify-center py-1"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronDown size={14} />
      </RadixSelect.ScrollDownButton>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
SelectContent.displayName = RadixSelect.Content.displayName

export const SelectItem = forwardRef<
  ElementRef<typeof RadixSelect.Item>,
  ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    style={{ color: 'var(--text)' }}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none',
      'data-[highlighted]:bg-[var(--surface-2)]',
      'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
      'transition-colors',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex items-center justify-center">
      <RadixSelect.ItemIndicator>
        <Check size={14} style={{ color: 'var(--primary)' }} />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
))
SelectItem.displayName = RadixSelect.Item.displayName
