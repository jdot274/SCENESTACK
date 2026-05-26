"use client"

import { useEffect, useRef } from "react"
import { useScenes } from "@/lib/store"
import { SceneWindowView } from "./scene/scene-window"

export function Workspace() {
  const scenes = useScenes((s) => s.scenes)
  const select = useScenes((s) => s.select)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Seed with a couple of demo scenes on first mount
    const st = useScenes.getState()
    if (st.scenes.length > 0) return
    st.add({
      type: "preset",
      title: "Plasma Shader",
      presetId: "shader-plasma",
      meshColor: "#06b6d4",
      background: "#050510",
      x: 80,
      y: 80,
    })
    st.add({
      type: "preset",
      title: "Fresnel Sphere",
      presetId: "shader-fresnel",
      meshColor: "#f97316",
      background: "#0f0a14",
      x: 540,
      y: 140,
    })
    st.add({
      type: "preset",
      title: "Metal Knot",
      presetId: "torus-knot",
      meshColor: "#e2e8f0",
      background: "#16161f",
      x: 280,
      y: 420,
    })
  }, [])

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        // Click on empty workspace deselects
        if (e.target === ref.current) select(null)
      }}
      className="relative flex-1 overflow-hidden bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      {scenes.map((s) => (
        <SceneWindowView key={s.id} scene={s} />
      ))}

      {scenes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <p className="text-sm font-mono text-muted-foreground">Empty workspace</p>
            <p className="text-xs text-muted-foreground/70">Click &quot;New Scene&quot; to add a 3D layer</p>
          </div>
        </div>
      )}
    </div>
  )
}
