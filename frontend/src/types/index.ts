// ===== Ponto de Cp (formato Recharts) =====
export interface CpPoint {
  x: number
  cp: number
}

// ===== Dados de Pressão (Cp) =====
export interface CpData {
  upper: CpPoint[]
  lower: CpPoint[]
  cl: number
  cd: number
  cl_cd: number
  alpha: number
  naca: string
}

// ===== Ponto do Campo de Velocidade =====
export interface VelocityPoint {
  x: number
  y: number
  u: number
  v: number
  magnitude: number
  normalized: number
}

// ===== Ponto do Contorno do Aerofólio =====
export interface AirfoilPoint {
  x: number
  y: number
}

// ===== Dados do Campo de Velocidade =====
export interface VelocityData {
  points: VelocityPoint[]
  airfoil: AirfoilPoint[]
  speed: number
  alpha: number
  maxVelocity: number
  minVelocity: number
}

// ===== Ponto de Streamline =====
export interface StreamlinePoint {
  x: number
  y: number
  z: number
  speed: number
}

// ===== Streamline completa =====
export interface Streamline {
  path: StreamlinePoint[]
  startY: number
  startZ: number
}

// ===== Vértice 3D =====
export interface Vertex3D {
  x: number
  y: number
  z: number
}

// ===== Geometria do Túnel =====
export interface TunnelGeometry {
  vertices: Vertex3D[]
  edges: number[][]
  dimensions: { width: number; height: number; depth: number }
}

// ===== Geometria do Objeto =====
export interface ObjectGeometry {
  type: string
  vertices: Vertex3D[]
  faces: number[][]
  center: Vertex3D
}

// ===== Stats do escoamento =====
export interface FlowStats {
  maxSpeed: number
  minSpeed: number
  avgSpeed: number
  reynolds: number
  inputSpeed: number
  objectType: string
}

// ===== Dados do Túnel 3D =====
export interface TunnelData {
  tunnel: TunnelGeometry
  object: ObjectGeometry
  particles: Streamline[]
  stats: FlowStats
}

// ===== Parâmetros de Controle =====
export interface ControlParams {
  speed: number
  alpha: number
  objectType: ObjectType
  size: number
  naca: string
  arrowSize: number
  arrowColor: string
}

export type ObjectType = 'naca0012' | 'sphere' | 'cylinder'

export const OBJECT_LABELS: Record<ObjectType, string> = {
  naca0012: 'Asa de Avião (NACA)',
  sphere: 'Esfera',
  cylinder: 'Cilindro',
}

// ===== Parâmetros do Túnel 3D (payload para API) =====
export interface TunnelParams {
  speed: number
  alpha: number
  objectType: string
  size: number
}

// ===== Dados das métricas =====
export interface AeroMetrics {
  cl: number
  cd: number
  efficiency: number
  reynolds: number
  maxVelocity: number
}

// ===== Estado geral da aerosimulação =====
export interface AeroState {
  cpData: CpData | null
  velocityData: VelocityData | null
  tunnelData: TunnelData | null
  metrics: AeroMetrics | null
  loading: boolean
  error: string | null
}

// ===== Tab ativa =====
export type ActiveTab = 'tunnel' | 'pressure' | 'velocity'
