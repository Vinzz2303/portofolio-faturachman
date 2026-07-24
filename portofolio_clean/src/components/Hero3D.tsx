'use client'
import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Organic breathing blob (centerpiece) ─────────────── */
function OrganicBlob() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // slow organic rotation
    meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.3
    meshRef.current.rotation.y = t * 0.08
    meshRef.current.rotation.z = Math.cos(t * 0.12) * 0.15
    // breathing scale
    const breathe = 1 + Math.sin(t * 0.6) * 0.04
    meshRef.current.scale.setScalar(breathe)
    // wireframe follows
    wireRef.current.rotation.copy(meshRef.current.rotation)
    wireRef.current.scale.setScalar(breathe * 1.02)
  })

  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.3}>
      <group>
        {/* Main distorted glass blob - HIGHLY OPTIMIZED */}
        <Sphere ref={meshRef} args={[1.4, 32, 32]}>
          <MeshDistortMaterial
            color="#1a9e94"
            distort={0.45}
            speed={1.8}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.12}
          />
        </Sphere>
        {/* Wireframe overlay - organic look */}
        <Sphere ref={wireRef} args={[1.42, 32, 32]}>
          <meshBasicMaterial
            color="#25d0c3"
            wireframe
            transparent
            opacity={0.04}
          />
        </Sphere>
        {/* Inner glow core */}
        <Sphere args={[0.5, 32, 32]}>
          <meshBasicMaterial
            color="#25d0c3"
            transparent
            opacity={0.06}
          />
        </Sphere>
      </group>
    </Float>
  )
}

/* ─── Floating glass ring ──────────────────────────────── */
function GlassRing({ position, color, size = 0.5 }: {
  position: [number, number, number]
  color: string
  size?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    ref.current.rotation.x = Math.sin(t * 0.3 + position[0]) * 0.5
    ref.current.rotation.y = t * 0.15
  })
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2} position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[size, size * 0.15, 12, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.4}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  )
}

/* ─── Soft floating orbs with glow ─────────────────────── */
function GlowOrb({ position, color, size = 0.15 }: {
  position: [number, number, number]
  color: string
  size?: number
}) {
  return (
    <Float speed={2.5 + Math.random()} rotationIntensity={0} floatIntensity={2} position={position}>
      <Sphere args={[size, 12, 12]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </Sphere>
      {/* Outer glow halo */}
      <Sphere args={[size * 2.5, 12, 12]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.03}
        />
      </Sphere>
    </Float>
  )
}

/* ─── Ambient flowing particles ────────────────────────── */
function FlowParticles({ count = 50 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      spd[i] = 0.2 + Math.random() * 0.8
    }
    return { positions: pos, speeds: spd }
  }, [count])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // gentle drift upward with sine wave
      posAttr.array[i3 + 1] += speeds[i] * 0.003
      posAttr.array[i3] += Math.sin(t * speeds[i] * 0.3 + i) * 0.001
      // reset if too high
      if (posAttr.array[i3 + 1] > 8) posAttr.array[i3 + 1] = -8
    }
    posAttr.needsUpdate = true
    ref.current.rotation.y = t * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#25d0c3"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ─── Mouse-reactive camera ──────────────────────────── */
function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame(({ camera }) => {
    // very smooth lerp for organic feel
    smooth.current.x += (mouse.current.x * 0.5 - smooth.current.x) * 0.02
    smooth.current.y += (mouse.current.y * 0.3 - smooth.current.y) * 0.02
    camera.position.x = smooth.current.x
    camera.position.y = smooth.current.y
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── Full Scene ──────────────────────────────────────── */
function Scene() {
  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />

      {/* Colored point lights for depth - OPTIMIZED to 1 light for FPS */}
      <pointLight position={[-3, 2, 4]} intensity={3} color="#25d0c3" distance={12} decay={2} />

      {/* Main elements */}
      <OrganicBlob />
      <GlassRing position={[2.8, 0.8, -1.5]} color="#4ea8de" size={0.45} />
      <GlassRing position={[-2.5, -0.5, -0.8]} color="#a78bfa" size={0.35} />

      {/* Scattered glow orbs - OPTIMIZED count */}
      <GlowOrb position={[2.2, 2.0, -0.5]} color="#25d0c3" size={0.12} />
      <GlowOrb position={[-2.0, 1.5, 0.3]} color="#a78bfa" size={0.09} />
      <GlowOrb position={[1.0, -2.2, 0.8]} color="#4ea8de" size={0.1} />

      {/* Flowing particles */}
      <FlowParticles />

      {/* Camera interaction */}
      <CameraRig />
    </>
  )
}

/* ─── Export ──────────────────────────────────────────── */
export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
