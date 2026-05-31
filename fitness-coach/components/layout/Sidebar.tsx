'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Activity,
  Moon,
  Footprints,
  BarChart3,
  Play,
  BookOpen,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Allenamenti',  icon: Dumbbell,        href: '/allenamenti' },
  { label: 'Nutrizione',   icon: Utensils,        href: '/nutrizione' },
  { label: 'Corpo',        icon: Activity,        href: '/corpo/peso' },
  { label: 'Sonno',        icon: Moon,            href: '/sonno' },
  { label: 'Passi',        icon: Footprints,      href: '/passi' },
  { label: 'Analisi',      icon: BarChart3,       href: '/analisi' },
  { label: 'Video',        icon: Play,            href: '/video' },
  { label: 'Paper',        icon: BookOpen,        href: '/paper' },
  { label: 'Impostazioni', icon: Settings,        href: '/impostazioni' },
]

function getItalianDate(): string {
  const now = new Date()
  const weekday = now.toLocaleDateString('it-IT', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleDateString('it-IT', { month: 'short' })
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
  return `${capitalizedWeekday} ${day} ${capitalizedMonth}`
}

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        className={cn(
          'fixed top-0 left-0 h-screen z-40 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-5 h-14 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xl">🔥</span>
          <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--text)' }}>
            Coach Pro
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    style={active ? {
                      background: 'rgba(99,102,241,0.12)',
                      color: 'var(--primary)',
                      borderLeft: '2px solid var(--primary)',
                    } : {
                      color: 'var(--text-muted)',
                      borderLeft: '2px solid transparent',
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
                      'transition-colors duration-150',
                      !active && 'hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                    )}
                  >
                    <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom date */}
        <div
          className="px-5 py-4 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {getItalianDate()}
          </p>
        </div>
      </aside>
    </>
  )
}
