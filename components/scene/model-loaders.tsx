"use client"

import { Suspense, useEffect, useState } from "react"
import { Bounds, Center, OrbitControls, Stage, useGLTF } from "@react-three/drei"
import * as THREE from "three"

/**
 * GLB/GLTF model viewer. Auto-frames the model.
 */
export function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  )
}

/**
 * USDZ model viewer using three.js's experimental USDZLoader. Loads on demand
 * from the three examples bundle. Real USD (.usd / .usda / .usdc) requires a
 * WASM-based loader (three-usdz-loader) which is not bundled by default.
 */
export function USDZModel({ url, name = "scene.usdz" }: { url: string; name?: string }) {
  const [group, setGroup] = useState<THREE.Group | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setGroup(null)

    const isUsd = /\.usda?$|\.usdc$/i.test(name)
    if (isUsd) {
      setError(
        "Native USD (.usd/.usda/.usdc) requires a WASM loader. Convert to USDZ or GLB, or enable three-usdz-loader.",
      )
      return
    }

    ;(async () => {
      try {
        // Dynamic import keeps the loader out of the initial bundle.
        const mod: { USDZLoader: new () => { parse: (buf: ArrayBuffer) => THREE.Group } } = await import(
          // @ts-expect-error - examples module ships without bundled types
          "three/examples/jsm/loaders/USDZLoader.js"
        )
        const res = await fetch(url)
        const buf = await res.arrayBuffer()
        const loader = new mod.USDZLoader()
        const grp = loader.parse(buf)
        if (!cancelled) setGroup(grp)
      } catch (e) {
        if (!cancelled) setError(`USDZ load failed: ${(e as Error).message}`)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [url, name])

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f87171" wireframe />
      </mesh>
    )
  }
  if (!group) return null

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={group} />
      </Center>
    </Bounds>
  )
}

export function ModelStage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Stage environment="city" intensity={0.4} adjustCamera={false} shadows={false}>
        {children}
      </Stage>
      <OrbitControls makeDefault enableDamping />
    </Suspense>
  )
}
