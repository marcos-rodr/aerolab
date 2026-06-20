import React, { useState } from 'react'
import {
  Wind,
  RotateCcw,
  Box,
  Maximize,
  Info,
  ChevronDown,
  ChevronRight,
  Zap,
  Palette,
  Plane,
  Settings2,
} from 'lucide-react'
import type { ControlParams, ObjectType } from '../types'
import { OBJECT_LABELS } from '../types'

interface ControlPanelProps {
  params: ControlParams
  onChange: (params: ControlParams) => void
  isCollapsed?: boolean
  onExpand?: () => void
}

const PRESETS = [
  {
    label: 'Decolagem (Alto Lift)',
    values: { speed: 60, alpha: 15, objectType: 'naca0012', size: 1.2, naca: '4412', arrowSize: 1, arrowColor: 'velocity' }
  },
  {
    label: 'Voo de Cruzeiro',
    values: { speed: 90, alpha: 2, objectType: 'naca0012', size: 1.0, naca: '2412', arrowSize: 1, arrowColor: 'velocity' }
  },
  {
    label: 'Asa Invertida (F1)',
    values: { speed: 80, alpha: -10, objectType: 'naca0012', size: 0.8, naca: '0012', arrowSize: 1, arrowColor: 'velocity' }
  },
] as const

// ─── Types ──────────────────────────────────────────
type SectionId = 'presets' | 'wind' | 'angle' | 'shape' | 'size' | 'arrows' | 'naca'

interface MenuItemDef {
  id: SectionId
  label: string
  icon: React.ReactNode
  shortLabel: string
}

const MENU_ITEMS: MenuItemDef[] = [
  { id: 'presets', label: 'Cenários Rápidos', icon: <Zap className="h-5 w-5" />, shortLabel: 'Presets' },
  { id: 'wind',    label: 'Velocidade do Vento', icon: <Wind className="h-5 w-5" />, shortLabel: 'Vento' },
  { id: 'angle',   label: 'Ângulo de Ataque', icon: <RotateCcw className="h-5 w-5" />, shortLabel: 'Ângulo' },
  { id: 'shape',   label: 'Formato do Objeto', icon: <Box className="h-5 w-5" />, shortLabel: 'Forma' },
  { id: 'size',    label: 'Tamanho do Objeto', icon: <Maximize className="h-5 w-5" />, shortLabel: 'Escala' },
  { id: 'arrows',  label: 'Aparência das Setas', icon: <Palette className="h-5 w-5" />, shortLabel: 'Setas' },
  { id: 'naca',    label: 'Perfil NACA', icon: <Plane className="h-5 w-5" />, shortLabel: 'NACA' },
]

// ─── Tooltip ────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[10px] text-aero-text-dim transition hover:bg-white/20 hover:text-aero-text"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg bg-aero-surface border border-aero-border px-3 py-2 text-xs text-aero-text shadow-xl">
          {text}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────
export default function ControlPanel({
  params,
  onChange,
  isCollapsed = false,
  onExpand,
}: ControlPanelProps) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['wind']))

  const update = (key: keyof ControlParams, value: any) => {
    onChange({ ...params, [key]: value })
  }

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ─── COLLAPSED: icon-only sidebar ───
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-3">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={onExpand}
            title={item.label}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-aero-text-muted transition-all hover:bg-white/10 hover:text-aero-blue"
          >
            {item.icon}
          </button>
        ))}
      </div>
    )
  }

  // ─── EXPANDED: full menu ───
  const applyPreset = (presetValues: typeof PRESETS[0]['values']) => {
    onChange({ ...presetValues })
  }

  // Helper to render a section
  const isOpen = (id: SectionId) => openSections.has(id)

  return (
    <div className="flex flex-col py-2">
      {MENU_ITEMS.map((item) => {
        const open = isOpen(item.id)

        return (
          <div key={item.id}>
            {/* ── Menu Item Row ── */}
            <button
              onClick={() => toggleSection(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                open
                  ? 'bg-gradient-to-r from-aero-blue/15 to-transparent text-aero-text border-l-2 border-aero-blue'
                  : 'text-aero-text-muted hover:bg-white/5 hover:text-aero-text border-l-2 border-transparent'
              }`}
            >
              <span className={`shrink-0 transition-colors ${open ? 'text-aero-blue' : ''}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-aero-text-dim transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* ── Expandable Content ── */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-2 pl-[52px]">
                {/* ── Presets ── */}
                {item.id === 'presets' && (
                  <div className="space-y-1.5">
                    {PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => applyPreset(preset.values)}
                        className="flex w-full items-center gap-2 rounded-lg border border-aero-border bg-aero-surface/50 px-3 py-2 text-xs font-medium text-aero-text transition-all hover:border-aero-blue/40 hover:bg-aero-blue/10"
                      >
                        <Zap className="h-3 w-3 text-aero-yellow" />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Wind Speed ── */}
                {item.id === 'wind' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tooltip text="Velocidade do ar passando pelo objeto, em metros por segundo." />
                      <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-sm font-bold text-aero-cyan border border-aero-border">
                        {params.speed} m/s
                      </span>
                    </div>
                    <input
                      type="range" min={0} max={100} step={1}
                      value={params.speed}
                      onChange={(e) => update('speed', parseFloat(e.target.value))}
                      className="w-full cursor-pointer accent-aero-blue"
                    />
                    <div className="flex justify-between text-[10px] text-aero-text-dim">
                      <span>0 m/s</span><span>100 m/s</span>
                    </div>
                  </div>
                )}

                {/* ── Angle ── */}
                {item.id === 'angle' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tooltip text="Inclinação em relação ao vento. Acima de 15° pode causar estol." />
                      <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-sm font-bold text-aero-cyan border border-aero-border">
                        {params.alpha}°
                      </span>
                    </div>
                    <input
                      type="range" min={-20} max={20} step={0.5}
                      value={params.alpha}
                      onChange={(e) => update('alpha', parseFloat(e.target.value))}
                      className="w-full cursor-pointer accent-aero-blue"
                    />
                    <div className="flex justify-between text-[10px] text-aero-text-dim">
                      <span>-20°</span><span>20°</span>
                    </div>
                  </div>
                )}

                {/* ── Shape ── */}
                {item.id === 'shape' && (
                  <div className="space-y-2">
                    <Tooltip text="Escolha a forma do objeto dentro do túnel de vento." />
                    <div className="relative">
                      <select
                        value={params.objectType}
                        onChange={(e) => update('objectType', e.target.value as ObjectType)}
                        className="w-full cursor-pointer appearance-none rounded-lg bg-aero-surface border border-aero-border px-3 py-2 pr-8 text-sm text-aero-text outline-none transition hover:border-aero-blue/50 focus:border-aero-blue"
                      >
                        {(Object.entries(OBJECT_LABELS) as [ObjectType, string][]).map(
                          ([value, label]) => (
                            <option key={value} value={value} className="bg-aero-surface">
                              {label}
                            </option>
                          )
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-aero-text-dim" />
                    </div>
                  </div>
                )}

                {/* ── Size ── */}
                {item.id === 'size' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tooltip text="Escala do objeto (0.5x a 2.0x)." />
                      <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-sm font-bold text-aero-cyan border border-aero-border">
                        {params.size}x
                      </span>
                    </div>
                    <input
                      type="range" min={0.5} max={2.0} step={0.1}
                      value={params.size}
                      onChange={(e) => update('size', parseFloat(e.target.value))}
                      className="w-full cursor-pointer accent-aero-blue"
                    />
                    <div className="flex justify-between text-[10px] text-aero-text-dim">
                      <span>0.5x</span><span>2.0x</span>
                    </div>
                  </div>
                )}

                {/* ── Arrows ── */}
                {item.id === 'arrows' && (
                  <div className="space-y-4">
                    {/* Arrow size */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-aero-text-muted">Tamanho</span>
                        <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-xs font-bold text-aero-cyan border border-aero-border">
                          {params.arrowSize}x
                        </span>
                      </div>
                      <input
                        type="range" min={0.2} max={3.0} step={0.1}
                        value={params.arrowSize}
                        onChange={(e) => onChange({ ...params, arrowSize: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-aero-blue"
                      />
                    </div>

                    {/* Arrow color */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-aero-text-muted">Cor</span>
                      <div className="flex flex-wrap gap-2">
                        {/* Auto / velocity */}
                        <button
                          type="button"
                          onClick={() => onChange({ ...params, arrowColor: 'velocity' })}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            params.arrowColor === 'velocity'
                              ? 'border-aero-blue bg-aero-blue/20 text-aero-blue shadow-sm shadow-aero-blue/20'
                              : 'border-aero-border bg-aero-surface text-aero-text-muted hover:border-aero-blue/40'
                          }`}
                        >
                          <span className="block h-2.5 w-8 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-red-500" />
                          Auto
                        </button>
                        {/* Color swatches */}
                        {[
                          { color: '#ffffff', label: 'Branco' },
                          { color: '#3b82f6', label: 'Azul' },
                          { color: '#22c55e', label: 'Verde' },
                          { color: '#ef4444', label: 'Vermelho' },
                          { color: '#facc15', label: 'Amarelo' },
                          { color: '#a855f7', label: 'Roxo' },
                        ].map(({ color, label }) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => onChange({ ...params, arrowColor: color })}
                            className={`group relative h-7 w-7 rounded-full border-2 transition-all duration-150 ${
                              params.arrowColor === color
                                ? 'border-aero-blue scale-110 shadow-lg ring-2 ring-aero-blue/30'
                                : 'border-white/10 hover:scale-110 hover:border-white/30'
                            }`}
                            style={{ backgroundColor: color }}
                            title={label}
                          >
                            {params.arrowColor === color && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="h-2 w-2 rounded-full bg-black/40" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── NACA ── */}
                {item.id === 'naca' && (
                  <div className="space-y-3">
                    <Tooltip text="Série de 4 dígitos. Ex: '0012' simétrico, '4412' alto lift." />
                    {/* Quick picks */}
                    <div className="flex gap-1.5">
                      {['0012', '4412', '2412', '0006'].map((code) => (
                        <button
                          key={code}
                          onClick={() => update('naca', code)}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-all ${
                            params.naca === code
                              ? 'border-aero-cyan bg-aero-cyan/15 text-aero-cyan'
                              : 'border-aero-border bg-aero-surface/50 text-aero-text-muted hover:border-aero-cyan/40 hover:text-aero-text'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                    {/* Manual input */}
                    <input
                      type="text"
                      value={params.naca}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        update('naca', v)
                      }}
                      maxLength={4}
                      className="w-full rounded-lg bg-aero-surface border border-aero-border px-3 py-2.5 text-center font-mono text-lg font-bold tracking-[0.3em] text-aero-cyan outline-none transition-all focus:border-aero-blue focus:ring-1 focus:ring-aero-blue/30"
                      placeholder="0012"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
