"use client"

import { useScenes } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Sparkles, Code2, Box, Github, Zap, Globe, FileCode2, Layers } from "lucide-react"
import { PRESETS } from "@/components/scene/presets"
import { SAMPLE_CODE } from "@/components/scene/code-runner"
import { DEFAULT_THREE_TEMPLATE } from "@/components/scene/threejs-runner"
import { DEFAULT_GL_TEMPLATE } from "@/components/scene/webgl2-runner"
import { DEFAULT_HTML_TEMPLATE } from "@/components/scene/html-sandbox"
import type { SceneWindow } from "@/lib/store"

const DEFAULT_FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_mouse;
void main(){
  vec2 p = vUv*2.0-1.0;
  float r = length(p);
  float a = atan(p.y,p.x);
  float v = 0.5 + 0.5*sin(8.0*a + u_time*1.4 - r*6.0);
  vec3 col = mix(vec3(0.05,0.07,0.12), vec3(0.5,0.85,1.0), v);
  gl_FragColor = vec4(col,1.0);
}`

export function Toolbar() {
  const add = useScenes((s) => s.add)
  const scenes = useScenes((s) => s.scenes)

  const addPreset = (presetId: keyof typeof PRESETS) =>
    add({ type: "preset", title: PRESETS[presetId].label, presetId: presetId as SceneWindow["presetId"] })

  const addCode = () =>
    add({ type: "code", title: "R3F Code", code: SAMPLE_CODE, meshColor: "#f59e0b" })

  const addThree = () =>
    add({ type: "threejs", title: "Three.js Module", threeCode: DEFAULT_THREE_TEMPLATE, background: "#0b0b10" })

  const addShader = (lang: "glsl" | "wgsl") =>
    add({
      type: "shader",
      title: lang === "glsl" ? "GLSL Shader" : "WGSL Shader",
      shaderCode: DEFAULT_FRAGMENT,
      shaderLang: lang,
      background: "#000000",
    })

  const addWebGL2 = () =>
    add({ type: "webgl2", title: "WebGL2 Pipeline", glCode: DEFAULT_GL_TEMPLATE, background: "#000000" })

  const addGlb = () =>
    add({ type: "glb", title: "GLB Model", glbUrl: "/assets/3d/duck.glb", background: "#1a1a24" })

  const addUsd = () =>
    add({ type: "usd", title: "USD / USDZ", usdUrl: "", usdName: "scene.usdz", background: "#1a1a24" })

  const addSpline = () =>
    add({
      type: "spline",
      title: "Spline Scene",
      splineUrl: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
      background: "#0b0b10",
    })

  const addHtml = (mode: "iframe" | "texture") =>
    add({
      type: "html",
      title: mode === "iframe" ? "HTML Sandbox" : "HTML → 3D Texture",
      htmlCode: DEFAULT_HTML_TEMPLATE,
      htmlMode: mode,
      background: "#0b0b10",
    })

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-xs font-semibold tracking-wider">SCENESTACK</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">WebGL Compositor</span>
        </div>
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            New Scene
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Built-in Presets
          </DropdownMenuLabel>
          {Object.entries(PRESETS).map(([k, v]) => (
            <DropdownMenuItem key={k} onClick={() => addPreset(k as keyof typeof PRESETS)}>
              <Sparkles className="mr-2 size-3.5" />
              <div className="flex flex-col">
                <span className="text-xs">{v.label}</span>
                <span className="text-[10px] text-muted-foreground">{v.description}</span>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Code Sources
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={addCode}>
            <Code2 className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">React Three Fiber</span>
              <span className="text-[10px] text-muted-foreground">Paste R3F JSX components</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addThree}>
            <FileCode2 className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">Three.js Module</span>
              <span className="text-[10px] text-muted-foreground">Raw three.js scene module</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addWebGL2}>
            <Zap className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">WebGL2 Pipeline</span>
              <span className="text-[10px] text-muted-foreground">Raw WebGL2 rendering pipeline</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sparkles className="mr-2 size-3.5" />
              <span className="text-xs">Shader Snippet</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => addShader("glsl")}>
                <span className="text-xs">GLSL fragment</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShader("wgsl")}>
                <span className="text-xs">WGSL fragment</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Imports & Embeds
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={addGlb}>
            <Box className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">GLB / glTF Model</span>
              <span className="text-[10px] text-muted-foreground">Standard 3D model</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addUsd}>
            <Box className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">USD / USDZ</span>
              <span className="text-[10px] text-muted-foreground">Universal Scene Description</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addSpline}>
            <Sparkles className="mr-2 size-3.5" />
            <div className="flex flex-col">
              <span className="text-xs">Spline Scene</span>
              <span className="text-[10px] text-muted-foreground">Embed a Spline .splinecode URL</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe className="mr-2 size-3.5" />
              <span className="text-xs">HTML / CSS / JS</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => addHtml("iframe")}>
                <span className="text-xs">Sandboxed iframe panel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addHtml("texture")}>
                <span className="text-xs">Rasterize → 3D texture</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-3">
        <span className="font-mono text-[10px] text-muted-foreground">
          {scenes.length} {scenes.length === 1 ? "layer" : "layers"}
        </span>
        <a
          href="https://github.com/pmndrs/react-three-fiber"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          <Github className="size-4" />
        </a>
      </div>
    </div>
  )
}
