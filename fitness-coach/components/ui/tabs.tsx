'use client'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

export const Tabs = RadixTabs.Root

export const TabsList = forwardRef<
  ElementRef<typeof RadixTabs.List>,
  ComponentPropsWithoutRef<typeof RadixTabs.List>
>(({ className, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
    className={cn(
      'inline-flex items-center gap-1 rounded-lg border p-1',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = RadixTabs.List.displayName

export const TabsTrigger = forwardRef<
  ElementRef<typeof RadixTabs.Trigger>,
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(({ className, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md',
      'transition-colors select-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
      'data-[state=inactive]:text-[var(--text-muted)] data-[state=inactive]:hover:text-[var(--text)]',
      'data-[state=active]:text-[var(--text)] data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = RadixTabs.Trigger.displayName

export const TabsContent = forwardRef<
  ElementRef<typeof RadixTabs.Content>,
  ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(({ className, ...props }, ref) => (
  <RadixTabs.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = RadixTabs.Content.displayName
