import { useState, useEffect, useRef, useCallback } from 'react'
import type { CpData, VelocityData, TunnelData, AeroMetrics, ControlParams } from '../types'
import { fetchCpData, fetchVelocityField, fetchTunnelData } from '../api/aerolab'

interface UseAeroDataReturn {
  cpData: CpData | null
  velocityData: VelocityData | null
  tunnelData: TunnelData | null
  metrics: AeroMetrics | null
  loading: boolean
  error: string | null
}

export function useAeroData(params: ControlParams): UseAeroDataReturn {
  const [cpData, setCpData] = useState<CpData | null>(null)
  const [velocityData, setVelocityData] = useState<VelocityData | null>(null)
  const [tunnelData, setTunnelData] = useState<TunnelData | null>(null)
  const [metrics, setMetrics] = useState<AeroMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAllData = useCallback(async (p: ControlParams) => {
    // Cancela requisição anterior
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const [cpResult, velResult, tunnelResult] = await Promise.allSettled([
        fetchCpData(p.alpha, p.naca),
        fetchVelocityField(p.speed, p.alpha),
        fetchTunnelData({
          speed: p.speed,
          alpha: p.alpha,
          objectType: p.objectType,
          size: p.size,
        }),
      ])

      if (cpResult.status === 'fulfilled') {
        const cp = cpResult.value
        setCpData(cp)

        // Calcula métricas a partir dos dados retornados
        const reynolds = (p.speed * 1.0 * 1.225) / 1.81e-5
        const maxVel = velResult.status === 'fulfilled' 
          ? velResult.value.maxVelocity 
          : p.speed * 1.5

        setMetrics({
          cl: cp.cl,
          cd: cp.cd,
          efficiency: cp.cl_cd,
          reynolds: Math.round(reynolds),
          maxVelocity: Math.round(maxVel * 10) / 10,
        })
      }

      if (velResult.status === 'fulfilled') {
        setVelocityData(velResult.value)
      }

      if (tunnelResult.status === 'fulfilled') {
        setTunnelData(tunnelResult.value)
      }

      // Verifica se pelo menos uma requisição foi bem sucedida
      const allFailed = [cpResult, velResult, tunnelResult].every(
        (r) => r.status === 'rejected'
      )

      if (allFailed) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Erro ao buscar dados da simulação.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchAllData(params)
    }, 400) // 400ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [params.speed, params.alpha, params.objectType, params.size, params.naca, fetchAllData])

  return { cpData, velocityData, tunnelData, metrics, loading, error }
}
