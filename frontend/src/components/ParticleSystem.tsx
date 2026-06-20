import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Streamline } from '../types'

interface ParticleSystemProps {
  streamlines: Streamline[] | null
  maxVelocity: number
  alpha?: number
  arrowSize?: number
  arrowColor?: string
}

/**
 * Converte velocidade normalizada (0-1) para cor no gradiente:
 * azul → cyan → amarelo → vermelho
 */
function velocityToColor(t: number): THREE.Color {
  if (t < 0.25) {
    const s = t / 0.25
    return new THREE.Color(0, s, 1)
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25
    return new THREE.Color(0, 1, 1 - s)
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25
    return new THREE.Color(s, 1, 0)
  } else {
    const s = (t - 0.75) / 0.25
    return new THREE.Color(1, 1 - s, 0)
  }
}

export default function ParticleSystem({
  streamlines,
  maxVelocity,
  alpha,
  arrowSize = 1,
  arrowColor = 'velocity',
}: ParticleSystemProps) {
  const progressRef = useRef<Float32Array | null>(null)
  const speedsRef = useRef<Float32Array | null>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)

  // Ref dinâmico para não precisar recriar hooks
  const arrowPropsRef = useRef({ size: arrowSize, color: arrowColor })
  useEffect(() => {
    arrowPropsRef.current = { size: arrowSize, color: arrowColor }
  }, [arrowSize, arrowColor])

  // Gera dados de fallback se streamlines é null
  const fallbackStreamlines = useMemo(() => {
    if (streamlines && streamlines.length > 0) return streamlines

    const lines: Streamline[] = []
    const numLines = 30

    for (let i = 0; i < numLines; i++) {
      const line: any[] = []
      const y = (i / (numLines - 1)) * 4 - 2
      const z = ((i % 5) / 4) * 2 - 1
      const numPoints = 60

      for (let j = 0; j < numPoints; j++) {
        const x = (j / (numPoints - 1)) * 8 - 2
        const distToCenter = Math.sqrt(
          (x * x) / 4 + y * y + z * z
        )
        const deflection =
          distToCenter < 1.5
            ? (1.5 - distToCenter) * 0.5 * Math.sign(y || 0.1)
            : 0
        const vel = 0.3 + 0.7 * Math.min(1, distToCenter / 2)

        line.push({
          x,
          y: y + deflection,
          z,
          speed: vel * (maxVelocity || 50),
        })
      }
      lines.push({ path: line, startY: y, startZ: z })
    }
    return lines
  }, [streamlines, maxVelocity])

  // Inicializa dados de partículas
  const count = useMemo(() => {
    const particlesPerLine = 4
    const total = fallbackStreamlines.length * particlesPerLine
    const prog = new Float32Array(total)
    const spd = new Float32Array(total)

    let idx = 0
    for (let i = 0; i < fallbackStreamlines.length; i++) {
      if (!fallbackStreamlines[i]) continue
      const line = fallbackStreamlines[i].path || []
      if (line.length < 2) continue

      for (let p = 0; p < particlesPerLine; p++) {
        const t = (p / particlesPerLine + Math.random() * 0.2) % 1
        const lineIdx = Math.floor(t * (line.length - 1))
        const pt = line[lineIdx]
        if (!pt) continue

        const velNorm = Math.min(1, (pt.speed || 0) / (maxVelocity || 50))
        prog[idx] = t
        spd[idx] = 0.002 + velNorm * 0.008
        idx++
      }
    }

    progressRef.current = prog
    speedsRef.current = spd
    return idx
  }, [fallbackStreamlines, maxVelocity])

  // Geometria do cone (mini-seta) reutilizada por todas as instâncias (sempre scale 1, escalamos dinamicamente no useFrame)
  const arrowGeo = useMemo(() => {
    const cone = new THREE.ConeGeometry(0.035, 0.14, 6)
    cone.rotateX(Math.PI / 2)
    return cone
  }, [])

  // Anima posição + orientação das mini-setas
  useFrame(() => {
    if (!instancedRef.current || !progressRef.current || !speedsRef.current) return

    const linesCount = fallbackStreamlines.length
    if (linesCount === 0) return
    const particlesPerLine = 4
    const dummy = new THREE.Object3D()
    const col = new THREE.Color()

    for (let i = 0; i < count; i++) {
      progressRef.current[i] += speedsRef.current[i]
      if (progressRef.current[i] >= 1) {
        progressRef.current[i] = 0
      }

      const lineIdx = Math.floor(i / particlesPerLine) % linesCount
      if (!fallbackStreamlines[lineIdx]) continue
      const line = fallbackStreamlines[lineIdx].path || []
      if (!line || line.length < 2) continue

      const t = progressRef.current[i]
      const ptIdx = Math.min(Math.floor(t * (line.length - 1)), line.length - 1)
      const pt = line[ptIdx]
      if (!pt) continue

      let px = pt.x || 0
      let py = pt.y || 0
      let pz = pt.z || 0

      // Turbulência visual em estol
      if (Math.abs(alpha || 0) >= 15 && px > 0) {
        const noiseFactor = 0.8 * (px / 2)
        py += (Math.random() - 0.5) * noiseFactor
        pz += (Math.random() - 0.5) * noiseFactor
      }

      dummy.position.set(px, py, pz)

      // Orientar seta na direção do próximo ponto
      const nextIdx = Math.min(ptIdx + 1, line.length - 1)
      const nextPt = line[nextIdx]
      if (nextPt && nextIdx !== ptIdx) {
        dummy.lookAt(nextPt.x || 0, nextPt.y || 0, nextPt.z || 0)
      }

      // Escala dinâmica
      const sc = arrowPropsRef.current.size || 1
      dummy.scale.set(sc, sc, sc)

      dummy.updateMatrix()
      instancedRef.current.setMatrixAt(i, dummy.matrix)

      // Cor por velocidade ou cor fixa
      const prefColor = arrowPropsRef.current.color
      if (prefColor && prefColor !== 'velocity') {
        col.set(prefColor)
      } else {
        const velNorm = Math.min(1, (pt.speed || 0) / (maxVelocity || 50))
        col.copy(velocityToColor(velNorm))
      }
      instancedRef.current.setColorAt(i, col)
    }

    instancedRef.current.instanceMatrix.needsUpdate = true
    if (instancedRef.current.instanceColor) {
      instancedRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Linhas das streamlines */}
      {fallbackStreamlines.map((streamline, i) => {
        if (!streamline) return null
        const line = streamline.path || []
        if (line.length < 2) return null
        const points = line.map((p) => new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0))
        const colors = line.map((p) => {
          const prefColor = arrowPropsRef.current.color
          if (prefColor && prefColor !== 'velocity') {
            return new THREE.Color(prefColor)
          }
          const velNorm = Math.min(1, (p.speed || 0) / (maxVelocity || 50))
          return velocityToColor(velNorm)
        })

        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const colorArray = new Float32Array(colors.length * 3)
        colors.forEach((c, j) => {
          colorArray[j * 3] = c.r
          colorArray[j * 3 + 1] = c.g
          colorArray[j * 3 + 2] = c.b
        })
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3))

        return (
          <line key={i}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial vertexColors transparent opacity={0.2} linewidth={1} />
          </line>
        )
      })}

      {/* Mini-setas instanciadas (vetores de velocidade) */}
      <instancedMesh
        ref={instancedRef}
        args={[arrowGeo, undefined, count]}
        frustumCulled={false}
      >
        <meshBasicMaterial vertexColors transparent opacity={0.95} />
      </instancedMesh>
    </group>
  )
}
