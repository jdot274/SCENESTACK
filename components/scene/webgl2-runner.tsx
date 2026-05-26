"use client"

import { useEffect, useRef } from "react"
import * as Babel from "@babel/standalone"

const DEFAULT_GL_CODE = `// Raw WebGL2 module. You receive { gl, canvas }.
// Return { tick?: (t) => void, dispose?: () => void }.
const vs = \`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }\`;
const fs = \`#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_time;
out vec4 o;
void main(){
  vec2 p = v_uv*2.0-1.0;
  float r = length(p);
  float a = atan(p.y,p.x);
  float v = 0.5 + 0.5*sin(8.0*a + u_time*1.2 - r*6.0);
  o = vec4(vec3(v)*vec3(0.4,0.7,1.0), 1.0);
}\`;
const compile = (type, src) => {
  const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
};
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'a_pos');
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const uTime = gl.getUniformLocation(prog, 'u_time');
return {
  tick: (t) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog); gl.bindVertexArray(vao);
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  },
  dispose: () => { gl.deleteProgram(prog); gl.deleteBuffer(buf); gl.deleteVertexArray(vao); }
};`

export const DEFAULT_GL_TEMPLATE = DEFAULT_GL_CODE

/**
 * Pure WebGL2 pipeline runner. The user gets a raw WebGL2RenderingContext
 * with no Three.js abstraction — useful for custom rendering pipelines,
 * compute-style fragment work, MRT setups, etc.
 */
export function WebGL2Runner({ code }: { code?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const errRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const errEl = errRef.current
    if (!canvas) return
    if (errEl) errEl.textContent = ""

    const gl = canvas.getContext("webgl2", { antialias: true, premultipliedAlpha: false })
    if (!gl) {
      if (errEl) errEl.textContent = "WebGL2 not supported in this browser."
      return
    }

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    let raf = 0
    let result: { tick?: (t: number) => void; dispose?: () => void } | undefined
    try {
      const src = code?.trim() || DEFAULT_GL_CODE
      const compiled = Babel.transform(src, {
        presets: [["env", { targets: { esmodules: true } }]],
        filename: "gl-user.js",
      }).code as string
      const fn = new Function("gl", "canvas", compiled)
      const r = fn(gl, canvas)
      if (r && typeof r === "object") result = r
    } catch (e) {
      if (errEl) errEl.textContent = `WebGL2 error: ${(e as Error).message}`
    }

    const start = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = (performance.now() - start) / 1000
      try {
        result?.tick?.(t)
      } catch (e) {
        if (errEl) errEl.textContent = `Tick error: ${(e as Error).message}`
        cancelAnimationFrame(raf)
      }
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
    }
  }, [code])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={errRef}
        className="pointer-events-none absolute bottom-2 left-2 right-2 max-h-24 overflow-auto rounded bg-destructive/90 px-2 py-1 font-mono text-xs text-destructive-foreground empty:hidden"
      />
    </div>
  )
}
