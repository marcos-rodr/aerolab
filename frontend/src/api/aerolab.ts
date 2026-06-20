import axios from 'axios'
import type { CpData, VelocityData, TunnelData, TunnelParams } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Busca dados de pressão (Cp) sobre o aerofólio
 */
export async function fetchCpData(
  alpha: number,
  naca: string = '0012'
): Promise<CpData> {
  const { data } = await api.get<CpData>('/cp', {
    params: { alpha, naca },
  })
  return data
}

/**
 * Busca campo de velocidade 2D ao redor do aerofólio
 */
export async function fetchVelocityField(
  speed: number,
  alpha: number
): Promise<VelocityData> {
  const { data } = await api.get<VelocityData>('/velocity', {
    params: { speed, alpha },
  })
  return data
}

/**
 * Busca dados do túnel de vento 3D (streamlines, objeto, limites)
 */
export async function fetchTunnelData(
  params: TunnelParams
): Promise<TunnelData> {
  const { data } = await api.post<TunnelData>('/3d-tunnel', params)
  return data
}
