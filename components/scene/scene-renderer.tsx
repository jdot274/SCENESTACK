"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import type { SceneWindow } from "@/lib/store"
import { PRESETS } from "./presets"
import { CodeRunner } from "./code-runner"
import { ShaderRunner } from "./shader-runner"
import { ThreeJSRunner } from "./threejs-runner"
import { WebGL2Runner } from "./webgl2-runner"
import { GLBModel, USDZModel, ModelStage } from "./model-loaders"
import { HtmlSandbox, HtmlTexturePanel } from "./html-sandbox"
import { SplineEmbed } from "./spline-embed"

type Source = "canvas" | "dom"

/** Sources that manage their own rendering surface (DOM/iframe/own canvas). */
function sourceFor(scene: SceneWindow): Source {
  if (scene.type === "threejs") return "dom"
  if (scene.type === "webgl2") return "dom"
  if (scene.type === "spline") return "dom"
  if (scene.type === "html" && (scene.htmlMode ?? "iframe") === "iframe") return "dom"
  return "canvas"
}

function CanvasContents({
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
  if (scene.type === "code") {
    return (
      <CodeRunner code={scene.code ?? ""} color={scene.meshColor} speed={scene.rotationSpeed} onError={onError} />
    )
  }
  if (scene.type === "shader") {
    return <ShaderRunner fragment={scene.shaderCode} lang={scene.shaderLang ?? "glsl"} />
  }
  if (scene.type === "glb" && scene.glbUrl) {
    return (
      <ModelStage>
        <GLBModel url={scene.glbUrl} />
      </ModelStage>
    )
  }
  if (scene.type === "usd" && scene.usdUrl) {
    return (
      <ModelStage>
        <USDZModel url={scene.usdUrl} name={scene.usdName ?? "scene.usdz"} />
      </ModelStage>
    )
  }
  if (scene.type === "html" && (scene.htmlMode ?? "iframe") === "texture") {
    return <HtmlTexturePanel code={scene.htmlCode} />
  }
  return null
}

export function SceneRenderer({ scene }: { scene: SceneWindow }) {
  const [error, setError] = useState<string | null>(null)
  const src = sourceFor(scene)

  if (src === "dom") {
    return (
      <div className="relative h-full w-full" style={{ background: scene.background }}>
        {scene.type === "threejs" && <ThreeJSRunner code={scene.threeCode} background={scene.background} />}
        {scene.type === "webgl2" && <WebGL2Runner code={scene.glCode} />}
        {scene.type === "spline" && <SplineEmbed url={scene.splineUrl ?? ""} />}
        {scene.type === "html" && (scene.htmlMode ?? "iframe") === "iframe" && <HtmlSandbox code={scene.htmlCode} />}
      </div>
    )
  }

  const useEnvironment = scene.type === "glb" || scene.type === "usd"
  const useOrbit = scene.type !== "shader" && scene.type !== "glb" && scene.type !== "usd"

  return (
    <div className="relative h-full w-full">
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
          <CanvasContents scene={scene} onError={setError} />
          {useEnvironment && <Environment preset="studio" />}
        </Suspense>
        {useOrbit && <OrbitControls enableDamping makeDefault />}
      </Canvas>
      {error && (
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 max-h-20 overflow-auto rounded bg-destructive/90 px-2 py-1 font-mono text-[10px] text-destructive-foreground">
          {error}
        </div>
      )}
    </div>
  )
}
