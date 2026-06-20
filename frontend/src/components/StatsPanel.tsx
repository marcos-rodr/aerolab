import { useEffect, useState, useRef } from 'react'
import { Plane, Wind, Gauge, Calculator, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { AeroMetrics } from '../types'

interface StatsPanelProps {
  metrics: AeroMetrics | null
  loading: boolean
  snapshot?: AeroMetrics | null
}

interface AnimatedNumberProps {
  value: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
}

function AnimatedNumber({
  value,
  decimals = 2,
  duration = 600,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const animRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    startRef.current = display
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = startRef.current + (value - startRef.current) * eased
      setDisplay(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [value, duration])

  const formatted =
    Math.abs(display) >= 1000
      ? display.toLocaleString('pt-BR', {
          maximumFractionDigits: 0,
        })
      : display.toFixed(decimals)

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

function DeltaBadge({
  current,
  previous,
  invertGoodBad = false,
}: {
  current: number
  previous?: number
  invertGoodBad?: boolean
}) {
  if (previous === undefined || previous === 0) return null
  const diff = current - previous
  if (Math.abs(diff) < 0.0001) return null

  const percent = (diff / Math.abs(previous)) * 100
  const isPositive = diff > 0

  // Se invertGoodBad é true (ex: Drag), um aumento é Ruim.
  let isGood = isPositive
  if (invertGoodBad) isGood = !isGood

  return (
    <div
      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
        isGood ? 'bg-aero-green/10 text-aero-green' : 'bg-aero-red/10 text-aero-red'
      }`}
    >
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(percent).toFixed(1)}%
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  decimals?: number
  suffix?: string
  color: string
  statusColor?: string
  description: string
  snapshotValue?: number
  invertGoodBadDelta?: boolean
}

function StatCard({
  icon,
  label,
  value,
  decimals = 2,
  suffix = '',
  color,
  statusColor = 'text-aero-text',
  description,
  snapshotValue,
  invertGoodBadDelta,
}: StatCardProps) {
  return (
    <div className="glass glass-hover group animate-fade-in flex items-center gap-3 rounded-2xl px-4 py-3 border border-aero-border shadow-sm transition-all duration-300 hover:shadow-lg">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-aero-text-muted">
            {label}
          </p>
          {snapshotValue !== undefined && (
            <DeltaBadge current={value} previous={snapshotValue} invertGoodBad={invertGoodBadDelta} />
          )}
        </div>
        <p className={`font-mono text-xl font-extrabold tracking-tight ${statusColor} transition-colors duration-500`}>
          <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
        </p>
        <p className="truncate text-[10px] font-medium text-aero-text-dim">{description}</p>
      </div>
    </div>
  )
}

export default function StatsPanel({ metrics, loading, snapshot }: StatsPanelProps) {
  if (!metrics && !loading) return null

  const m = metrics ?? {
    cl: 0,
    cd: 0,
    efficiency: 0,
    reynolds: 0,
    maxVelocity: 0,
  }

  // Lógica de Feedback Educacional condicional
  const getEfficiencyStatus = (eff: number) => {
    if (eff < 5) return 'text-aero-red'
    if (eff > 20) return 'text-aero-green'
    return 'text-aero-yellow'
  }

  const getReynoldsStatus = (re: number) => {
    if (re < 50000) return 'text-aero-yellow'
    return 'text-aero-green'
  }

  return (
    <div className="space-y-3 tour-stats">
      <div className="flex items-center gap-2 px-1">
        <div className="h-1.5 w-1.5 rounded-full bg-aero-cyan" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-aero-text-muted">
          Resultados Analíticos
        </h2>
        {loading && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-aero-blue border-t-transparent ml-auto" />
        )}
      </div>

      <div className="space-y-2.5">
        <StatCard
          icon={<Plane className="h-5 w-5 text-white" />}
          label="Sustentação (Cl)"
          value={m.cl}
          decimals={3}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          description="Força que mantém no ar"
          snapshotValue={snapshot?.cl}
        />

        <StatCard
          icon={<Wind className="h-5 w-5 text-white" />}
          label="Arrasto (Cd)"
          value={m.cd}
          decimals={4}
          color="bg-gradient-to-br from-red-500 to-rose-600"
          description="Resistência aerodinâmica"
          snapshotValue={snapshot?.cd}
          invertGoodBadDelta
        />

        <StatCard
          icon={<Gauge className="h-5 w-5 text-white" />}
          label="Eficiência (Cl/Cd)"
          value={m.efficiency}
          decimals={1}
          color="bg-gradient-to-br from-emerald-400 to-green-600"
          statusColor={getEfficiencyStatus(m.efficiency)}
          description={m.efficiency > 20 ? "Ótimo (Planador)" : m.efficiency < 5 ? "Ruim (Estol)" : "Regular"}
          snapshotValue={snapshot?.efficiency}
        />

        <StatCard
          icon={<Calculator className="h-5 w-5 text-white" />}
          label="Reynolds (Re)"
          value={m.reynolds}
          decimals={0}
          color="bg-gradient-to-br from-purple-500 to-fuchsia-600"
          statusColor={getReynoldsStatus(m.reynolds)}
          description={m.reynolds > 50000 ? "Fluxo Turbulento (Realista)" : "Fluxo Laminar"}
          snapshotValue={snapshot?.reynolds}
        />

        <StatCard
          icon={<Zap className="h-5 w-5 text-white" />}
          label="Velocidade Máx."
          value={m.maxVelocity}
          decimals={1}
          suffix=" m/s"
          color="bg-gradient-to-br from-amber-400 to-orange-500"
          description="Ponto de maior aceleração"
          snapshotValue={snapshot?.maxVelocity}
        />
      </div>
    </div>
  )
}
