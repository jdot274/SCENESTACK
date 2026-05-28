"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment } from "@react-three/drei"
import * as THREE from "three"
import type { SceneWindow } from "@/lib/store"
import { PRESETS } from "./presets"
import { CodeRunner } from "./code-runner"

function GLBModel({ url, speed }: { url: string; speed: number }) {
  const { scene } = useGLTF(url)
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  // Center & scale-fit
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const max = Math.max(size.x, size.y, size.z) || 1
  const scale = 2 / max
  return (
    <group ref={ref} scale={scale} position={[-center.x * scale, -center.y * scale, -center.z * scale]}>
      <primitive object={scene} />
    </group>
  )
}

function SceneContents({
  scene,
  onError,
}: {
  scene: SceneWindow
  onError: (msg: string | null) => void
}) {
  if (scene.type === "preset" && scene.presetId) {
    const preset = PRESETS[scene.presetId]
    if (!preset) return null
    return preset.component({ color: scene.meshColor, speed: scene.rotationSpeed })
  }
  if (scene.type === "code" && scene.code) {
    return <CodeRunner code={scene.code} color={scene.meshColor} speed={scene.rotationSpeed} onError={onError} />
  }
  if (scene.type === "glb" && scene.glbUrl) {
    return (
      <Suspense fallback={null}>
        <GLBModel url={scene.glbUrl} speed={scene.rotationSpeed} />
      </Suspense>
    )
  }
  return null
}

export function SceneRenderer({ scene }: { scene: SceneWindow }) {
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: scene.cameraFov }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ background: scene.background }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={scene.ambient} />
        <directionalLight position={[5, 5, 5]} intensity={scene.directional} />
        <directionalLight position={[-5, -2, -5]} intensity={scene.directional * 0.4} color="#a78bfa" />
        <Suspense fallback={null}>
          <SceneContents scene={scene} onError={setError} />
          {scene.type === "glb" && <Environment preset="studio" />}
        </Suspense>
        <OrbitControls enableDamping makeDefault />
      </Canvas>
      {error && (
        <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono bg-destructive/90 text-destructive-foreground px-2 py-1 rounded max-h-20 overflow-auto">
          {error}
        </div>
      )}
    </div>
  )
}
