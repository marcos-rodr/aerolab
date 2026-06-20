import { useState, useMemo } from 'react'
import { Box, BarChart3, Waves, AlertCircle, Loader2, Camera, HelpCircle } from 'lucide-react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import StatsPanel from './components/StatsPanel'
import WindTunnel3D from './components/WindTunnel3D'
import CpChart from './components/CpChart'
import VelocityField from './components/VelocityField'
import { useAeroData } from './hooks/useAeroData'
import type { ControlParams, ActiveTab, AeroMetrics } from './types'

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'tunnel', label: 'Túnel 3D', icon: <Box className="h-4 w-4" /> },
  {
    id: 'pressure',
    label: 'Pressão na Asa',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: 'velocity',
    label: 'Campo de Velocidade',
    icon: <Waves className="h-4 w-4" />,
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tunnel')
  const [params, setParams] = useState<ControlParams>({
    speed: 30,
    alpha: 5,
    objectType: 'naca0012',
    size: 1,
    naca: '0012',
    arrowSize: 1,
    arrowColor: 'velocity',
  })

  const [snapshot, setSnapshot] = useState<AeroMetrics | null>(null)
  const [runTour, setRunTour] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const { cpData, velocityData, tunnelData, metrics, loading, error } =
    useAeroData(params)

  const memoizedParams = useMemo(() => params, [
    params.speed,
    params.alpha,
    params.objectType,
    params.size,
    params.naca,
    params.arrowSize,
    params.arrowColor,
  ])

  // Sidebar
  const sidebar = (
    <div className="flex h-full flex-col gap-6">
      <ControlPanel 
        params={memoizedParams} 
        onChange={setParams} 
        isCollapsed={isSidebarCollapsed}
        onExpand={() => setIsSidebarCollapsed(false)}
      />
      {!isSidebarCollapsed && (
        <div className="border-t border-aero-border pt-4">
          <StatsPanel metrics={metrics} loading={loading} snapshot={snapshot} />
        </div>
      )}
    </div>
  )

  return (
    <>
      <Layout 
        sidebar={sidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        {/* Tabs & Utilities */}
        <div className="flex items-center border-b border-aero-border px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-aero-text'
                    : 'text-aero-text-muted hover:text-aero-text'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-aero-blue to-aero-cyan transition-all" />
                )}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Status indicators */}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-aero-blue">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden md:inline">Simulando...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-aero-yellow">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden md:inline">Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da tab */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'tunnel' && (
            <WindTunnel3D
              tunnelData={tunnelData}
              objectType={params.objectType}
              size={params.size}
              alpha={params.alpha}
              speed={params.speed}
              arrowSize={params.arrowSize}
              arrowColor={params.arrowColor}
            />
          )}
          {activeTab === 'pressure' && (
            <CpChart cpData={cpData} loading={loading} />
          )}
          {activeTab === 'velocity' && (
            <VelocityField velocityData={velocityData} loading={loading} />
          )}
        </div>
      </Layout>
    </>
  )
}
