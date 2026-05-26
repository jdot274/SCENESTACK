"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const DEFAULT_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const DEFAULT_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  void main() {
    vec2 uv = vUv;
    vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx * 3.0 + vec3(0.0, 2.0, 4.0));
    gl_FragColor = vec4(col, 1.0);
  }
`

/**
 * GLSL shader runner. Renders a fullscreen quad (within the window) with a
 * user fragment shader. Provides time, resolution, and mouse uniforms — the
 * de-facto Shadertoy / glslsandbox convention adapted for three.js.
 *
 * WGSL is accepted for forward compatibility but transpiled to a stub error
 * fragment in WebGL contexts (see the inline notice). Real WGSL execution
 * requires WebGPU which is gated behind feature detection in WebGL2Runner.
 */
export function ShaderRunner({
  fragment,
  lang = "glsl",
  fullscreen = true,
}: {
  fragment?: string
  lang?: "glsl" | "wgsl"
  fullscreen?: boolean
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const isWgsl = lang === "wgsl"
  const frag = fragment?.trim() || DEFAULT_FRAGMENT

  const material = useMemo(() => {
    if (isWgsl) {
      // Surface a friendly error texture rather than crashing the canvas
      return new THREE.ShaderMaterial({
        vertexShader: DEFAULT_VERTEX,
        fragmentShader: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform float u_time;
          void main() {
            float s = step(0.5, fract(vUv.x * 12.0 + u_time * 0.2));
            float t = step(0.5, fract(vUv.y * 12.0));
            float c = abs(s - t);
            gl_FragColor = vec4(vec3(c) * 0.4 + vec3(0.05, 0.05, 0.08), 1.0);
          }
        `,
        uniforms: {
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(1, 1) },
          u_mouse: { value: new THREE.Vector2(0, 0) },
        },
      })
    }
    return new THREE.ShaderMaterial({
      vertexShader: DEFAULT_VERTEX,
      fragmentShader: frag,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(size.width, size.height) },
        u_mouse: { value: new THREE.Vector2(0, 0) },
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frag, isWgsl])

  useFrame((state) => {
    const m = matRef.current
    if (!m) return
    m.uniforms.u_time.value = state.clock.elapsedTime
    m.uniforms.u_resolution.value.set(size.width, size.height)
    m.uniforms.u_mouse.value.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5)
  })

  return (
    <mesh>
      <planeGeometry args={fullscreen ? [viewport.width, viewport.height] : [2, 2]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  )
}
