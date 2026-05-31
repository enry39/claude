'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div
        style={{ marginLeft: 'var(--sidebar-width)' }}
        className="hidden md:block min-h-screen"
      >
        <main className="p-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
          {children}
        </main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 h-14 sticky top-0 z-20"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Apri menu"
          >
            <Menu size={20} />
          </button>
          <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text)' }}>
            <span>🔥</span>
            <span>Coach Pro</span>
          </span>
        </header>

        <main className="p-4" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
