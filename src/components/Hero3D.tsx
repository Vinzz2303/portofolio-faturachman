'use client'
import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Torus, Box, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Animated particle field ───────────────────────────── */
function Particles({ count = 80 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [count])

  useFrame((state) => {
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.04
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.02
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#25d0c3" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

/* ─── Floating distorted sphere (centerpiece) ────────────── */
function DistortedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
  })
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={meshRef} args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#25d0c3"
          distort={0.35}
          speed={2}
          roughness={0}
          metalness={0.9}
          transparent
          opacity={0.15}
          wireframe={false}
        />
      </Sphere>
      {/* Wireframe overlay */}
      <Sphere args={[1.12, 24, 24]}>
        <meshBasicMaterial color="#25d0c3" wireframe transparent opacity={0.07} />
      </Sphere>
    </Float>
  )
}

/* ─── Floating Torus ring ─────────────────────────────── */
function FloatingTorus() {
  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={0.8} position={[2.2, 0.4, -1]}>
      <Torus args={[0.55, 0.12, 16, 60]}>
        <meshStandardMaterial color="#4ea8de" metalness={1} roughness={0.1} transparent opacity={0.7} />
      </Torus>
    </Float>
  )
}

/* ─── Floating cube ───────────────────────────────────── */
function FloatingBox() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    ref.current.rotation.x = s.clock.getElapsedTime() * 0.3
    ref.current.rotation.z = s.clock.getElapsedTime() * 0.2
  })
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1} position={[-2.4, -0.3, -0.5]}>
      <Box ref={ref} args={[0.6, 0.6, 0.6]}>
        <meshStandardMaterial color="#a78bfa" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
      </Box>
    </Float>
  )
}

/* ─── Small accent orbs ───────────────────────────────── */
function AccentOrb({ position, color, size = 0.18 }: { position: [number,number,number], color: string, size?: number }) {
  return (
    <Float speed={3} rotationIntensity={0} floatIntensity={1.5} position={position}>
      <Sphere args={[size, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.5} roughness={0.1} />
      </Sphere>
    </Float>
  )
}

/* ─── Mouse-reactive camera raft ─────────────────────── */
function CameraRig() {
  const { camera, gl } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    gl.domElement.parentElement?.addEventListener('mousemove', handleMove)
    return () => gl.domElement.parentElement?.removeEventListener('mousemove', handleMove)
  }, [gl])

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.05
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── Scene ───────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 2, 3]} intensity={2} color="#25d0c3" distance={10} />
      <pointLight position={[4, -2, 2]} intensity={1.5} color="#4ea8de" distance={8} />
      <pointLight position={[0, 0, 4]} intensity={1} color="#a78bfa" distance={6} />

      <Particles />
      <DistortedSphere />
      <FloatingTorus />
      <FloatingBox />
      <AccentOrb position={[1.8, 1.6, -0.3]} color="#25d0c3" size={0.14} />
      <AccentOrb position={[-1.6, 1.2, 0.2]} color="#a78bfa" size={0.1} />
      <AccentOrb position={[0.6, -1.8, 0.5]} color="#4ea8de" size={0.12} />
      <AccentOrb position={[-0.8, -1.4, -0.8]} color="#d6b15d" size={0.08} />
      <CameraRig />
    </>
  )
}

/* ─── Export: drop-in Canvas ──────────────────────────── */
export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
