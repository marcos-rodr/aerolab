import React, { useEffect, useState } from 'react'
import { Sun, Moon, Wind, ChevronLeft, ChevronRight } from 'lucide-react'

interface LayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export default function Layout({ sidebar, children, isSidebarCollapsed, onToggleSidebar }: LayoutProps) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-aero-bg text-aero-text transition-colors duration-300">
      {/* ── Sidebar ── */}
      <aside
        className={`relative flex flex-col border-r border-aero-border bg-aero-surface/60 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-[300px]'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-aero-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aero-blue to-aero-cyan shadow-lg shadow-aero-blue/25">
            <Wind className="h-5 w-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden transition-all duration-200">
              <h1 className="gradient-text text-sm font-bold leading-tight tracking-tight">
                AeroLab
              </h1>
              <p className="text-[10px] font-medium text-aero-text-dim leading-tight">
                Laboratório Virtual
              </p>
            </div>
          )}
          {/* Collapse toggle */}
          <button
            onClick={onToggleSidebar}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-aero-border bg-aero-surface text-aero-text-muted transition-all hover:border-aero-blue hover:text-aero-text ${
              isSidebarCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
            title={isSidebarCollapsed ? 'Expandir' : 'Minimizar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Sidebar content (scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {sidebar}
        </div>

        {/* Footer: theme toggle */}
        <div className="shrink-0 border-t border-aero-border px-4 py-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/5 ${
              isSidebarCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            {isDark ? (
              <Sun className="h-5 w-5 shrink-0 text-aero-yellow" />
            ) : (
              <Moon className="h-5 w-5 shrink-0 text-aero-blue" />
            )}
            {!isSidebarCollapsed && (
              <>
                <span className="text-aero-text-muted">
                  {isDark ? 'Modo Claro' : 'Modo Escuro'}
                </span>
                <div
                  className={`ml-auto flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                    isDark ? 'bg-aero-blue' : 'bg-aero-border'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isDark ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
