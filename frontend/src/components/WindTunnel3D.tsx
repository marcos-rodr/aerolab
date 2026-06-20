import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, GradientTexture, Grid } from '@react-three/drei'
import * as THREE from 'three'
import type { TunnelData, ObjectType } from '../types'
import ParticleSystem from './ParticleSystem'

interface WindTunnel3DProps {
  tunnelData: TunnelData | null
  objectType: ObjectType
  size: number
  alpha: number
  speed: number
  arrowSize: number
  arrowColor: string
}

/** Túnel wireframe */
function TunnelWireframe({ tunnel }: { tunnel?: TunnelData['tunnel'] }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    let verticesList: number[] = [];
    
    if (tunnel && tunnel.edges && Array.isArray(tunnel.edges) && tunnel.vertices) {
      // Usar dados da API
      tunnel.edges.forEach(edge => {
        if (!edge) return;
        const v1 = tunnel.vertices[edge[0]];
        const v2 = tunnel.vertices[edge[1]];
        if (v1 && v2) {
          verticesList.push(v1.x, v1.y, v1.z);
          verticesList.push(v2.x, v2.y, v2.z);
        }
      });
    } else {
      // Bounds padrão
      const x_min = -1.5, x_max = 1.5, y_min = -0.75, y_max = 0.75, z_min = -0.75, z_max = 0.75;
      verticesList = [
        x_min, y_min, z_min, x_max, y_min, z_min,
        x_max, y_min, z_min, x_max, y_min, z_max,
        x_max, y_min, z_max, x_min, y_min, z_max,
        x_min, y_min, z_max, x_min, y_min, z_min,
        x_min, y_max, z_min, x_max, y_max, z_min,
        x_max, y_max, z_min, x_max, y_max, z_max,
        x_max, y_max, z_max, x_min, y_max, z_max,
        x_min, y_max, z_max, x_min, y_max, z_min,
        x_min, y_min, z_min, x_min, y_max, z_min,
        x_max, y_min, z_min, x_max, y_max, z_min,
        x_max, y_min, z_max, x_max, y_max, z_max,
        x_min, y_min, z_max, x_min, y_max, z_max,
      ];
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(verticesList, 3))
    return geo
  }, [tunnel])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.2} />
    </lineSegments>
  )
}

/** Objeto sólido (aerofólio, esfera ou cilindro) */
function AeroObject({
  objectType,
  size,
  alpha,
  vertices,
  faces,
}: {
  objectType: ObjectType
  size: number
  alpha: number
  vertices?: { x: number; y: number; z: number }[]
  faces?: number[][]
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Rotação suave
  useFrame(() => {
    if (meshRef.current) {
      const targetRot = (alpha * Math.PI) / 180
      meshRef.current.rotation.z +=
        (targetRot - meshRef.current.rotation.z) * 0.05
    }
  })

  // Calcula geometria da API se disponível
  const hasApiData = Boolean(vertices && faces && Array.isArray(vertices) && Array.isArray(faces) && vertices.length > 0 && faces.length > 0)
  
  const apiGeometry = useMemo(() => {
    if (!hasApiData || !vertices || !faces) return null;
    try {
      const geo = new THREE.BufferGeometry()
      const verts = new Float32Array(vertices.length * 3)
      vertices.forEach((v, i) => {
        verts[i * 3] = v.x || 0
        verts[i * 3 + 1] = v.y || 0
        verts[i * 3 + 2] = v.z || 0
      })
      const indices = new Uint16Array(faces.flat())
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      geo.setIndex(new THREE.BufferAttribute(indices, 1))
      geo.computeVertexNormals()
      return geo
    } catch(err) {
      return null;
    }
  }, [hasApiData, vertices, faces])

  // Material azul brilhante para destaque visual
  const material = (
    <meshStandardMaterial
      color="#60a5fa"
      emissive="#1d4ed8"
      emissiveIntensity={0.3}
      metalness={0.6}
      roughness={0.25}
    />
  )

  return (
    <>
      {hasApiData && apiGeometry ? (
        <mesh ref={meshRef} geometry={apiGeometry} scale={size} castShadow receiveShadow>
          {material}
        </mesh>
      ) : (
        <mesh ref={meshRef} scale={size} castShadow receiveShadow>
          {objectType === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
          {objectType === 'cylinder' && <cylinderGeometry args={[0.3, 0.3, 2, 32]} />}
          {(objectType === 'airfoil' || objectType === 'naca0012') && <AirfoilGeometry size={1} />}
          {material}
        </mesh>
      )}
    </>
  )
}

/** Geometria procedural de aerofólio NACA */
function AirfoilGeometry({ size }: { size: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const points = 40
    const chord = 2 * size

    const upperPoints: THREE.Vector2[] = []
    const lowerPoints: THREE.Vector2[] = []

    for (let i = 0; i <= points; i++) {
      const x = i / points
      const yt =
        0.12 / 0.2 *
        (0.2969 * Math.sqrt(x) -
          0.126 * x -
          0.3516 * x ** 2 +
          0.2843 * x ** 3 -
          0.1036 * x ** 4)

      upperPoints.push(new THREE.Vector2(x * chord - chord / 2, yt * chord))
      lowerPoints.push(new THREE.Vector2(x * chord - chord / 2, -yt * chord))
    }

    shape.moveTo(upperPoints[0].x, upperPoints[0].y)
    upperPoints.forEach((p) => shape.lineTo(p.x, p.y))
    for (let i = lowerPoints.length - 1; i >= 0; i--) {
      shape.lineTo(lowerPoints[i].x, lowerPoints[i].y)
    }
    shape.closePath()

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.5 * size,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    })
    geo.center()
    geo.rotateX(Math.PI / 2)
    return geo
  }, [size])

  return <primitive object={geometry} attach="geometry" />
}

/** Cena principal do túnel */
function TunnelScene({
  tunnelData,
  objectType,
  size,
  alpha,
  speed,
  arrowSize,
  arrowColor,
}: WindTunnel3DProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -5]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#3b82f6" />

      {/* Background e neblina */}
      <color attach="background" args={['#0c1222']} />
      <fog attach="fog" args={['#0c1222', 10, 25]} />

      {/* Grid no chão */}
      <Grid
        position={[1.5, -2.5, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#64748b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      <TunnelWireframe tunnel={tunnelData?.tunnel} />

      <AeroObject
        objectType={objectType}
        size={size}
        alpha={alpha}
        vertices={tunnelData?.object?.vertices}
        faces={tunnelData?.object?.faces}
      />

      <ParticleSystem
        streamlines={tunnelData?.particles ?? null}
        maxVelocity={tunnelData?.stats?.maxSpeed ?? speed * 1.5}
        alpha={alpha}
        arrowSize={arrowSize}
        arrowColor={arrowColor}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        target={[1, 0, 0]}
        makeDefault
      />
    </>
  )
}

export default function WindTunnel3D(props: WindTunnel3DProps) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [4, 3, 5],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <TunnelScene {...props} />
      </Canvas>

      {/* Overlay com info */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        <span className="text-xs text-slate-300">
          Arraste para rotacionar • Scroll para zoom
        </span>
      </div>

      {/* Legenda de cores */}
      <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-1 rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm">
        <span className="text-[10px] font-medium text-slate-400">Velocidade</span>
        <div className="flex items-center gap-1">
          <div className="h-2 w-16 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 via-50% via-yellow-400 to-red-500" />
        </div>
        <div className="flex w-16 justify-between text-[8px] text-slate-500">
          <span>Lenta</span>
          <span>Rápida</span>
        </div>
      </div>
    </div>
  )
}
