"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import * as Babel from "@babel/standalone"

const DEFAULT_THREE_CODE = `// Raw Three.js module. You receive { scene, camera, renderer, container, THREE }.
// Return an optional cleanup function. An animation loop is provided automatically
// if you set "tick" on the returned object: { tick: (t) => void, dispose?: () => void }
const geo = new THREE.IcosahedronGeometry(1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, flatShading: true, metalness: 0.2, roughness: 0.4 });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const dir = new THREE.DirectionalLight(0xffffff, 1.4);
dir.position.set(3, 4, 5);
scene.add(dir, new THREE.AmbientLight(0xffffff, 0.4));

camera.position.set(0, 0, 4);

return {
  tick: (t) => { mesh.rotation.x = t * 0.4; mesh.rotation.y = t * 0.6; },
  dispose: () => { geo.dispose(); mat.dispose(); }
};`

export const DEFAULT_THREE_TEMPLATE = DEFAULT_THREE_CODE

/**
 * Raw Three.js runner — runs a user-provided three.js module body inside a
 * sibling DOM container (NOT an R3F canvas). This lets users paste full
 * three.js scenes from docs/CodePen as-is. Returns a cleanup function.
 */
export function ThreeJSRunner({ code, background = "#0b0b10" }: { code?: string; background?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const errEl = errorRef.current
    if (!container) return

    if (errEl) errEl.textContent = ""
    container.innerHTML = ""

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(background)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)

    const fit = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
    }

    container.appendChild(renderer.domElement)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.domElement.style.display = "block"
    fit()

    const ro = new ResizeObserver(fit)
    ro.observe(container)

    let raf = 0
    let result: { tick?: (t: number) => void; dispose?: () => void } | undefined

    try {
      const src = code?.trim() || DEFAULT_THREE_CODE
      const compiled = Babel.transform(src, {
        presets: [["env", { targets: { esmodules: true } }]],
        filename: "three-user.js",
      }).code as string
      const fn = new Function("THREE", "scene", "camera", "renderer", "container", compiled)
      const r = fn(THREE, scene, camera, renderer, container)
      if (r && typeof r === "object") result = r
    } catch (e) {
      if (errEl) errEl.textContent = `Three.js error: ${(e as Error).message}`
    }

    const clock = new THREE.Clock()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = clock.getElapsedTime()
      try {
        result?.tick?.(t)
      } catch (e) {
        if (errEl) errEl.textContent = `Tick error: ${(e as Error).message}`
        cancelAnimationFrame(raf)
        return
      }
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      try {
        result?.dispose?.()
      } catch {
        /* noop */
      }
      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh
        if (anyObj.geometry) anyObj.geometry.dispose?.()
        const m = anyObj.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.())
        else m?.dispose?.()
      })
      renderer.dispose()
      container.innerHTML = ""
    }
  }, [code, background])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />
      <div
        ref={errorRef}
        className="pointer-events-none absolute bottom-2 left-2 right-2 max-h-24 overflow-auto rounded bg-destructive/90 px-2 py-1 font-mono text-xs text-destructive-foreground empty:hidden"
      />
    </div>
  )
}
