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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-aero-bg text-aero-text transition-colors duration-300">
      {/* Top Bar global */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-aero-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aero-blue to-aero-cyan shadow-lg shadow-aero-blue/20">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="gradient-text text-base font-bold tracking-tight leading-tight">
              AeroLab
            </h1>
            <p className="text-[10px] font-medium text-aero-text-dim leading-tight">
              Laboratório Virtual de Aerodinâmica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-aero-text-dim hidden sm:inline">
            {isDark ? 'Modo Escuro' : 'Modo Claro'}
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-aero-border bg-aero-surface text-aero-text-muted transition-all duration-200 hover:border-aero-border-bright hover:text-aero-text hover:scale-105 active:scale-95"
            title="Alternar Tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Corpo: sidebar + conteúdo com padding */}
      <div className="flex flex-1 gap-5 overflow-hidden p-5">
        {/* Sidebar flutuante com suporte a colapso */}
        <aside 
          className={`glass relative flex flex-col overflow-visible rounded-2xl border border-aero-border shadow-xl shadow-black/5 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-[80px] min-w-[80px]' : 'w-[340px] min-w-[340px]'
          }`}
        >
          {/* Botão de Toggle */}
          <button
            onClick={onToggleSidebar}
            className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-aero-border bg-aero-surface text-aero-text shadow-sm hover:scale-110 hover:border-aero-blue transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
            {sidebar}
          </div>

          {/* Footer (escondido se minimizado) */}
          {!isSidebarCollapsed && (
            <div className="border-t border-aero-border px-5 py-3 transition-opacity">
              <p className="text-center text-[10px] text-aero-text-dim">
                Simulação educacional • Dados aproximados
              </p>
            </div>
          )}
        </aside>

        {/* Área principal flutuante */}
        <main className="glass flex flex-1 flex-col overflow-hidden rounded-2xl border border-aero-border shadow-xl shadow-black/5">
          {children}
        </main>
      </div>
    </div>
  )
}
