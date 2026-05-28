"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import html2canvas from "html2canvas"

const DEFAULT_HTML = `<style>
  :root { color-scheme: dark; }
  body { margin: 0; font-family: ui-sans-serif, system-ui; background: #0f172a; color: #e2e8f0; height: 100vh; display:grid; place-items:center; }
  .card { padding: 24px 32px; border-radius: 16px; background: linear-gradient(135deg, #1e293b, #0b1220); box-shadow: 0 20px 50px rgba(0,0,0,.4); }
  h1 { margin: 0 0 8px; font-size: 28px; }
  button { margin-top: 12px; padding: 8px 14px; border-radius: 8px; border: 1px solid #334155; background: #0b1220; color: inherit; cursor: pointer; }
  button:hover { background: #1e293b; }
</style>
<div class="card">
  <h1>HTML / CSS / JS</h1>
  <p>Edit this snippet — it runs in a sandboxed iframe.</p>
  <button onclick="this.textContent = 'Clicked at ' + new Date().toLocaleTimeString()">Click me</button>
</div>`

export const DEFAULT_HTML_TEMPLATE = DEFAULT_HTML

function buildSrcDoc(code: string) {
  const trimmed = (code || "").trim() || DEFAULT_HTML
  // If it already looks like a full document, pass it through untouched.
  if (/<html[\s>]/i.test(trimmed) || /<!doctype/i.test(trimmed)) return trimmed
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${trimmed}</body></html>`
}

/**
 * Sandboxed iframe rendering of a CodePen-style HTML/CSS/JS snippet. The iframe
 * uses a tightly-scoped sandbox: scripts run in an opaque origin with no access
 * to the parent document, no top-level navigation, no form submission.
 */
export function HtmlSandbox({ code }: { code?: string }) {
  const srcDoc = useMemo(() => buildSrcDoc(code ?? ""), [code])
  return (
    <iframe
      title="html-sandbox"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full border-0 bg-white"
    />
  )
}

/**
 * Renders an HTML/CSS/JS snippet to an offscreen iframe, rasterizes it with
 * html2canvas at an interval, and projects the result as a 3D texture on a
 * curved plane inside the R3F scene. Lets HTML content live as a textured
 * panel alongside true 3D scenes.
 */
export function HtmlTexturePanel({ code, refreshMs = 1000 }: { code?: string; refreshMs?: number }) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Mount a hidden iframe outside the canvas, snapshot it periodically.
  useEffect(() => {
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.left = "-99999px"
    container.style.top = "0"
    container.style.width = "640px"
    container.style.height = "480px"
    container.style.pointerEvents = "none"
    document.body.appendChild(container)
    containerRef.current = container

    const iframe = document.createElement("iframe")
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin")
    iframe.style.width = "100%"
    iframe.style.height = "100%"
    iframe.style.border = "0"
    iframe.style.background = "#fff"
    iframe.srcdoc = buildSrcDoc(code ?? "")
    container.appendChild(iframe)
    iframeRef.current = iframe

    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null

    const snapshot = async () => {
      try {
        const doc = iframe.contentDocument
        if (!doc?.body) return
        const canvas = await html2canvas(doc.body, {
          backgroundColor: "#ffffff",
          width: 640,
          height: 480,
          scale: 1,
          logging: false,
          useCORS: true,
        })
        if (cancelled) return
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        setTexture((prev) => {
          prev?.dispose()
          return tex
        })
      } catch {
        /* swallow snapshot errors */
      }
    }

    const begin = () => {
      // Initial snapshot after iframe paints
      window.setTimeout(snapshot, 350)
      timer = setInterval(snapshot, refreshMs)
    }
    iframe.addEventListener("load", begin, { once: true })

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      iframe.remove()
      container.remove()
    }
  }, [code, refreshMs])

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.15
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.2, 2.4, 32, 24]} />
      <meshBasicMaterial map={texture ?? undefined} color={texture ? "white" : "#1f2937"} side={THREE.DoubleSide} />
    </mesh>
  )
}
