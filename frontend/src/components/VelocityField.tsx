import { useMemo, useRef, useEffect } from 'react'
import type { VelocityData } from '../types'

interface VelocityFieldProps {
  velocityData: VelocityData | null
  loading: boolean
}

/**
 * Mapeia valor normalizado (0-1) para cor no gradiente:
 * azul escuro → cyan → verde → amarelo → vermelho
 */
function velocityColorRGB(t: number): [number, number, number] {
  const clamp = Math.max(0, Math.min(1, t))

  if (clamp < 0.25) {
    const s = clamp / 0.25
    return [0, Math.round(s * 100), Math.round(150 + s * 55)]
  } else if (clamp < 0.5) {
    const s = (clamp - 0.25) / 0.25
    return [0, Math.round(100 + s * 155), Math.round(205 - s * 50)]
  } else if (clamp < 0.75) {
    const s = (clamp - 0.5) / 0.25
    return [Math.round(s * 255), 255, Math.round(155 * (1 - s))]
  } else {
    const s = (clamp - 0.75) / 0.25
    return [255, Math.round(255 * (1 - s)), 0]
  }
}

export default function VelocityField({
  velocityData,
  loading,
}: VelocityFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Dados demo se backend não conectou
  const data = useMemo(() => {
    if (velocityData) return velocityData

    // Gera campo de velocidade procedural
    const nx = 80
    const ny = 50
    const points: any[] = []
    const airfoil: any[] = []

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = -1 + (i / (nx - 1)) * 4
        const y = -1.5 + (j / (ny - 1)) * 3

        // Velocidade com aceleração sobre o aerofólio
        const distToAirfoil = Math.sqrt(
          Math.pow(x - 0.5, 2) * 0.5 + y * y * 2
        )
        const baseVel = 1.0
        let vel: number

        if (distToAirfoil < 0.2) {
          vel = 0 // Dentro do objeto
        } else if (distToAirfoil < 0.8) {
          // Aceleração perto da superfície
          vel = baseVel * (1 + 0.8 / distToAirfoil)
          if (y > 0) vel *= 1.2 // Mais rápido em cima
        } else {
          vel = baseVel * (1 + 0.15 * Math.exp(-distToAirfoil))
        }

        points.push({ x, y, u: vel, v: 0, magnitude: vel, normalized: vel / 2.5 })
      }
    }

    // Perfil do aerofólio
    for (let i = 0; i <= 50; i++) {
      const x = i / 50
      const yt =
        (0.12 / 0.2) *
        (0.2969 * Math.sqrt(x) -
          0.126 * x -
          0.3516 * x ** 2 +
          0.2843 * x ** 3 -
          0.1036 * x ** 4)
      airfoil.push({ x, y: yt })
    }
    for (let i = 49; i >= 0; i--) {
      const x = i / 50
      const yt =
        (0.12 / 0.2) *
        (0.2969 * Math.sqrt(x) -
          0.126 * x -
          0.3516 * x ** 2 +
          0.2843 * x ** 3 -
          0.1036 * x ** 4)
      airfoil.push({ x, y: -yt })
    }

    return {
      points,
      airfoil,
      speed: 30,
      alpha: 5,
      maxVelocity: 2.5,
      minVelocity: 0,
    } as VelocityData
  }, [velocityData])

  // Renderiza no canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    // Limpa
    ctx.fillStyle = '#0a0f1e'
    ctx.fillRect(0, 0, w, h)

    if (!data.points || data.points.length === 0) return

    // Encontra bounds
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    if (data.points.length > 0) {
      data.points.forEach(p => {
        if (p.x < xMin) xMin = p.x
        if (p.x > xMax) xMax = p.x
        if (p.y < yMin) yMin = p.y
        if (p.y > yMax) yMax = p.y
      })
    } else {
      xMin = -1; xMax = 3; yMin = -1.5; yMax = 1.5
    }

    const padding = 60
    const plotW = w - padding * 2
    const plotH = h - padding * 2

    const toScreenX = (x: number) =>
      padding + ((x - xMin) / (xMax - xMin)) * plotW
    const toScreenY = (y: number) =>
      padding + ((yMax - y) / (yMax - yMin)) * plotH

    // Determina o tamanho da célula baseado na distância mínima entre os pontos
    let minDx = Infinity;
    let minDy = Infinity;
    if (data.points.length > 1) {
      // Como os pontos podem estar fora de ordem, estimamos o passo do grid pegando os primeiros pontos.
      // Ou assumimos que a densidade padrão era 60, então 1/60 da largura
      minDx = (xMax - xMin) / 60;
      minDy = (yMax - yMin) / 60;
    } else {
      minDx = 0.1;
      minDy = 0.1;
    }

    const cellW = (minDx / (xMax - xMin)) * plotW * 1.5; // * 1.5 para evitar gaps
    const cellH = (minDy / (yMax - yMin)) * plotH * 1.5;

    // Renderiza mapa de calor
    const vRange = data.maxVelocity - data.minVelocity || 1

    if (data.points && Array.isArray(data.points)) {
      data.points.forEach((p) => {
        if (!p) return;
        const t = (p.magnitude - data.minVelocity) / vRange
        const [r, g, b] = velocityColorRGB(t)

        const sx = toScreenX(p.x) - cellW / 2
        const sy = toScreenY(p.y) - cellH / 2

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(sx, sy, cellW, cellH)
      })
    }

    // Desenha contorno do aerofólio
    if (data.airfoil && Array.isArray(data.airfoil) && data.airfoil.length > 2) {
      ctx.beginPath()
      ctx.moveTo(
        toScreenX(data.airfoil[0].x),
        toScreenY(data.airfoil[0].y)
      )

      for (let i = 1; i < data.airfoil.length; i++) {
        if (!data.airfoil[i]) continue;
        ctx.lineTo(
          toScreenX(data.airfoil[i].x),
          toScreenY(data.airfoil[i].y)
        )
      }

      ctx.closePath()
      ctx.fillStyle = '#0a0f1e'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1

    // Eixo X
    ctx.beginPath()
    ctx.moveTo(padding, h - padding)
    ctx.lineTo(w - padding, h - padding)
    ctx.stroke()

    // Eixo Y
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, h - padding)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#64748b'
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'

    // X ticks
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + (i / 4) * (xMax - xMin)
      const sx = toScreenX(xVal)
      ctx.fillText(xVal.toFixed(1), sx, h - padding + 15)
    }

    // Y ticks
    ctx.textAlign = 'right'
    for (let j = 0; j <= 4; j++) {
      const yVal = yMin + (j / 4) * (yMax - yMin)
      const sy = toScreenY(yVal)
      ctx.fillText(yVal.toFixed(1), padding - 8, sy + 3)
    }

    // Título dos eixos
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Posição horizontal (m)', w / 2, h - 15)

    ctx.save()
    ctx.translate(15, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Posição vertical (m)', 0, 0)
    ctx.restore()
  }, [data])

  return (
    <div className="flex h-full w-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="gradient-text text-lg font-bold">
            Campo de Velocidade
          </h3>
          <p className="text-xs text-slate-400">
            Mapa de calor mostrando a velocidade do ar ao redor do objeto
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            <span className="text-xs text-slate-400">Calculando...</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ display: 'block' }}
        />

        {/* Legenda */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
          <p className="mb-1 text-[10px] font-medium text-slate-400">
            Velocidade
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500">Lenta</span>
            <div className="h-3 w-24 rounded-full bg-gradient-to-r from-blue-800 via-cyan-400 via-green-400 via-yellow-400 to-red-500" />
            <span className="text-[9px] text-slate-500">Rápida</span>
          </div>
        </div>
      </div>

      {/* Explicação */}
      <div className="mt-3 rounded-lg bg-white/5 px-4 py-2">
        <p className="text-xs leading-relaxed text-slate-400">
          💡 <strong className="text-slate-300">Como ler:</strong> Cores{' '}
          <span className="text-red-400">quentes</span> indicam ar mais rápido
          (acima da asa). Cores{' '}
          <span className="text-blue-400">frias</span> indicam ar lento. A
          aceleração no topo é o que cria a{' '}
          <strong className="text-slate-300">queda de pressão</strong> que gera
          sustentação.
        </p>
      </div>
    </div>
  )
}
