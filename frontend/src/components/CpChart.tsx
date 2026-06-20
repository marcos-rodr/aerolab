import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { CpData } from '../types'

interface CpChartProps {
  cpData: CpData | null
  loading: boolean
}

interface ChartDataPoint {
  x: number
  cpUpper: number | null
  cpLower: number | null
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="glass rounded-lg px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs text-slate-400">
        Posição na asa: <span className="font-mono text-white">{(label * 100).toFixed(0)}%</span>
      </p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}:{' '}
          <span className="font-mono font-bold">{entry.value?.toFixed(3)}</span>
        </p>
      ))}
      <p className="mt-1 text-[10px] text-slate-500">
        {payload[0]?.value < 0
          ? '⬆ Pressão negativa = sucção para cima (sustentação)'
          : '⬇ Pressão positiva = empurra para baixo'}
      </p>
    </div>
  )
}

export default function CpChart({ cpData, loading }: CpChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!cpData) {
      // Dados demo: NACA 0012 a 5°
      const n = 50
      const data: ChartDataPoint[] = []
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1)
        const cpUpper =
          x < 0.05
            ? -3 * Math.sqrt(x / 0.05)
            : -0.8 * Math.exp(-2 * x) - 0.1
        const cpLower =
          x < 0.1 ? 0.5 * (1 - x / 0.1) : 0.1 * Math.exp(-3 * x)
        data.push({ x, cpUpper, cpLower })
      }
      return data
    }

    // Mapear do formato da API: upper/lower são arrays de {x, cp}
    const upperMap = new Map<number, number>()
    const lowerMap = new Map<number, number>()
    const allX = new Set<number>()

    if (cpData.upper && Array.isArray(cpData.upper)) {
      for (const pt of cpData.upper) {
        if (!pt) continue;
        upperMap.set(pt.x, pt.cp)
        allX.add(pt.x)
      }
    }
    
    if (cpData.lower && Array.isArray(cpData.lower)) {
      for (const pt of cpData.lower) {
        if (!pt) continue;
        lowerMap.set(pt.x, pt.cp)
        allX.add(pt.x)
      }
    }

    const data: ChartDataPoint[] = Array.from(allX)
      .sort((a, b) => a - b)
      .map((x) => ({
        x,
        cpUpper: upperMap.get(x) ?? null,
        cpLower: lowerMap.get(x) ?? null,
      }))

    return data
  }, [cpData])

  return (
    <div className="flex h-full w-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="gradient-text text-lg font-bold">Pressão sobre a Asa</h3>
          <p className="text-xs text-slate-400">
            Distribuição de pressão ao longo do perfil aerodinâmico
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            <span className="text-xs text-slate-400">Calculando...</span>
          </div>
        )}
        {cpData && (
          <div className="flex gap-3">
            <div className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm">
              <span className="text-slate-400">Cl = </span>
              <span className="font-mono font-bold text-blue-400">
                {cpData.cl.toFixed(3)}
              </span>
            </div>
            <div className="rounded-lg bg-red-500/10 px-3 py-1 text-sm">
              <span className="text-slate-400">NACA </span>
              <span className="font-mono font-bold text-red-400">
                {cpData.naca}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 1]}
              tickCount={11}
              tickFormatter={(v: number) => v.toFixed(1)}
              stroke="#64748b"
              fontSize={11}
              label={{
                value: 'Posição na asa (0 = borda frontal, 1 = traseira)',
                position: 'insideBottom',
                offset: -5,
                fill: '#64748b',
                fontSize: 10,
              }}
            />
            <YAxis
              reversed
              stroke="#64748b"
              fontSize={11}
              label={{
                value: 'Coeficiente de Pressão (Cp)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: '#64748b',
                fontSize: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
              iconType="line"
            />
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="5 5"
              label={{
                value: 'Cp = 0 (pressão ambiente)',
                fill: '#64748b',
                fontSize: 9,
                position: 'right',
              }}
            />
            <Line
              type="monotone"
              dataKey="cpUpper"
              name="Parte de cima (extradorso)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="cpLower"
              name="Parte de baixo (intradorso)"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explicação para leigos */}
      <div className="mt-3 rounded-lg bg-white/5 px-4 py-2">
        <p className="text-xs leading-relaxed text-slate-400">
          💡 <strong className="text-slate-300">Como ler:</strong> O eixo Y está
          invertido. A linha <span className="text-blue-400">azul</span> (parte de
          cima da asa) fica mais alta quando há sucção — é isso que gera{' '}
          <strong className="text-slate-300">sustentação</strong>. Quanto mais
          separadas as linhas, mais forte a sustentação.
        </p>
      </div>
    </div>
  )
}
