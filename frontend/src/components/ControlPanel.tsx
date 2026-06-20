import React, { useState } from 'react'
import {
  Wind,
  RotateCcw,
  Box,
  Maximize,
  Info,
  ChevronDown,
  Zap,
  Palette,
  MoveHorizontal,
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
    label: 'Asa Invertida (F1 Downforce)',
    values: { speed: 80, alpha: -10, objectType: 'naca0012', size: 0.8, naca: '0012', arrowSize: 1, arrowColor: 'velocity' }
  },
] as const

interface TooltipProps {
  text: string
}

function Tooltip({ text }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-aero-text-muted/20 text-[10px] text-aero-text-muted transition-colors hover:bg-aero-text-muted/40 hover:text-aero-text"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg bg-aero-surface border border-aero-border px-3 py-2 text-xs text-aero-text shadow-xl">
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-aero-border" />
        </div>
      )}
    </div>
  )
}

interface SliderControlProps {
  label: string
  tooltip: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  icon: React.ReactNode
  onChange: (value: number) => void
}

function SliderControl({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  unit,
  icon,
  onChange,
}: SliderControlProps) {
  return (
    <div className="animate-fade-in space-y-2 rounded-xl bg-aero-glass p-3 border border-aero-border-bright shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-aero-blue">{icon}</span>
          <span className="text-sm font-semibold text-aero-text">{label}</span>
          <Tooltip text={tooltip} />
        </div>
        <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-sm font-bold text-aero-cyan border border-aero-border">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer accent-aero-blue"
      />
      <div className="flex justify-between text-[10px] font-medium text-aero-text-dim uppercase tracking-wider">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function ControlPanel({
  params,
  onChange,
  isCollapsed = false,
  onExpand,
}: ControlPanelProps) {
  const update = (key: keyof ControlParams, value: any) => {
    onChange({ ...params, [key]: value })
  }

  // --- MODO MINIMIZADO (Apenas Ícones) ---
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-8 py-4 opacity-80 transition-opacity hover:opacity-100">
        <button onClick={onExpand} title="Configurações (Expandir)" className="p-2 text-aero-text hover:text-aero-blue">
          <Wind className="h-6 w-6" />
        </button>
        <button onClick={onExpand} title="Velocidade e Vento" className="p-2 text-aero-text-muted hover:text-aero-blue">
          <Zap className="h-5 w-5" />
        </button>
        <button onClick={onExpand} title="Ângulo de Ataque" className="p-2 text-aero-text-muted hover:text-aero-blue">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button onClick={onExpand} title="Formato do Objeto" className="p-2 text-aero-text-muted hover:text-aero-blue">
          <Box className="h-5 w-5" />
        </button>
        <button onClick={onExpand} title="Tamanho do Objeto" className="p-2 text-aero-text-muted hover:text-aero-blue">
          <Maximize className="h-5 w-5" />
        </button>
        <button onClick={onExpand} title="Aparência Visual" className="p-2 text-aero-text-muted hover:text-aero-blue">
          <Palette className="h-5 w-5" />
        </button>
      </div>
    )
  }

  // --- MODO EXPANDIDO ---
  const applyPreset = (presetValues: any) => {
    onChange({ ...presetValues })
  }

  return (
    <div className="space-y-6 tour-controls">
      {/* Cenários Globais / Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-aero-yellow" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-aero-text-muted">
            Cenários Rápidos
          </h2>
        </div>
        <div className="relative">
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              applyPreset(PRESETS[parseInt(e.target.value)].values)
              e.target.value = "" // reset select
            }}
            defaultValue=""
            className="glass w-full cursor-pointer appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-aero-text outline-none transition-all hover:bg-aero-glass-hover focus:border-aero-blue/50 focus:ring-1 focus:ring-aero-blue/30"
          >
            <option value="" disabled className="text-aero-text-dim">Escolha um preset didático...</option>
            {PRESETS.map((preset, i) => (
              <option key={i} value={i} className="bg-aero-surface text-aero-text">
                {preset.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aero-text-dim" />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <div className="h-1.5 w-1.5 rounded-full bg-aero-cyan" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-aero-text-muted">
          Controles da Simulação
        </h2>
      </div>

      {/* Velocidade do Vento */}
      <SliderControl
        label="Velocidade do Vento"
        tooltip="Velocidade do ar passando pelo objeto, em metros por segundo."
        value={params.speed}
        min={0}
        max={100}
        step={1}
        unit=" m/s"
        icon={<Wind className="h-4 w-4" />}
        onChange={(v) => update('speed', v)}
      />

      {/* Ângulo do Perfil */}
      <SliderControl
        label="Ângulo de Ataque"
        tooltip="Inclinação em relação ao vento. Acima de 15° pode causar estol (turbulência severa)."
        value={params.alpha}
        min={-20}
        max={20}
        step={0.5}
        unit="°"
        icon={<RotateCcw className="h-4 w-4" />}
        onChange={(v) => update('alpha', v)}
      />

      {/* Formato do Objeto */}
      <div className="animate-fade-in space-y-2 rounded-xl bg-aero-glass p-3 border border-aero-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-aero-blue">
            <Box className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-aero-text">
            Formato do Objeto
          </span>
          <Tooltip text="Escolha a forma física do objeto dentro do túnel de vento." />
        </div>
        <div className="relative">
          <select
            value={params.objectType}
            onChange={(e) => update('objectType', e.target.value as ObjectType)}
            className="w-full cursor-pointer appearance-none rounded-lg bg-aero-surface border border-aero-border px-4 py-2.5 pr-10 text-sm text-aero-text outline-none transition-all hover:border-aero-border-bright focus:border-aero-blue focus:ring-1 focus:ring-aero-blue/30"
          >
            {(Object.entries(OBJECT_LABELS) as [ObjectType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value} className="bg-aero-surface">
                  {label}
                </option>
              )
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aero-text-dim" />
        </div>
      </div>

      {/* Tamanho */}
      <SliderControl
        label="Tamanho"
        tooltip="Tamanho do objeto no túnel de vento (escala de 0.5x a 2.0x)."
        value={params.size}
        min={0.5}
        max={2.0}
        step={0.1}
        unit="x"
        icon={<Maximize className="h-4 w-4" />}
        onChange={(val) => onChange({ ...params, size: val })}
      />

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-aero-blue" />
          <span className="text-xs font-semibold text-aero-text uppercase tracking-wider">Aparência das Setas</span>
        </div>
        <div className="animate-fade-in space-y-4 rounded-xl bg-aero-glass p-3 border border-aero-border-bright shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-aero-text">Tamanho das Setas</span>
              <span className="rounded-md bg-aero-surface px-2 py-0.5 font-mono text-sm font-bold text-aero-cyan border border-aero-border">
                {params.arrowSize}x
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={params.arrowSize}
              onChange={(e) => onChange({ ...params, arrowSize: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-aero-blue"
            />
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-semibold text-aero-text">Cor das Setas</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...params, arrowColor: 'velocity' })}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  params.arrowColor === 'velocity'
                    ? 'border-aero-blue bg-aero-blue/20 text-aero-blue'
                    : 'border-aero-border bg-aero-surface text-aero-text-muted hover:border-aero-border-bright hover:text-aero-text'
                }`}
                title="Por Velocidade (Gradiente)"
              >
                <span className="block h-3 w-full rounded bg-gradient-to-r from-blue-500 via-cyan-400 to-red-500 opacity-80 mb-1" />
                Auto
              </button>
              {['#ffffff', '#22c55e', '#ef4444', '#facc15'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange({ ...params, arrowColor: color })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    params.arrowColor === color
                      ? 'border-aero-blue scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Cor fixa: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divisor NACA */}
      <div className="border-t border-aero-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-aero-cyan" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-aero-text-muted">
            Perfil NACA Aerodinâmico
          </h2>
          <Tooltip text="Série de 4 dígitos. Ex: '0012' simétrico, '4412' alto lift." />
        </div>

        {/* Atalhos NACA */}
        <div className="flex gap-2 mb-2">
          {['0012', '4412', '0006'].map(code => (
            <button
              key={code}
              onClick={() => update('naca', code)}
              className={`flex-1 rounded-lg border py-1 text-[10px] font-bold transition-all ${
                params.naca === code
                  ? 'border-aero-cyan bg-aero-cyan/10 text-aero-cyan'
                  : 'border-aero-border bg-aero-surface text-aero-text-muted hover:border-aero-border-bright hover:text-aero-text'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={params.naca}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
            update('naca', v)
          }}
          maxLength={4}
          className="glass w-full rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.4em] text-aero-cyan outline-none transition-all focus:border-aero-blue focus:ring-2 focus:ring-aero-blue/20"
          placeholder="0012"
        />
      </div>
    </div>
  )
}
