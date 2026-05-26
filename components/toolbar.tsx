"use client"

import { useScenes } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Sparkles, Code2, Box, Github } from "lucide-react"
import { PRESETS } from "@/components/scene/presets"
import { SAMPLE_CODE } from "@/components/scene/code-runner"
import type { SceneWindow } from "@/lib/store"

export function Toolbar() {
  const add = useScenes((s) => s.add)
  const scenes = useScenes((s) => s.scenes)

  const addPreset = (presetId: keyof typeof PRESETS) => {
    add({
      type: "preset",
      title: PRESETS[presetId].label,
      presetId: presetId as SceneWindow["presetId"],
    })
  }

  const addCode = () => {
    add({
      type: "code",
      title: "Code Scene",
      code: SAMPLE_CODE,
      meshColor: "#f59e0b",
    })
  }

  const addGlb = () => {
    add({
      type: "glb",
      title: "GLB Model",
      glbUrl: "/assets/3d/duck.glb",
      background: "#1a1a24",
    })
  }

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded bg-primary text-primary-foreground flex items-center justify-center">
          <Box className="size-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-mono font-semibold tracking-wider">SCENESTACK</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            WebGL Compositor
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            New Scene
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Shader / Mesh Presets
          </DropdownMenuLabel>
          {Object.entries(PRESETS).map(([k, v]) => (
            <DropdownMenuItem key={k} onClick={() => addPreset(k as keyof typeof PRESETS)}>
              <Sparkles className="size-3.5 mr-2" />
              <div className="flex flex-col">
                <span className="text-xs">{v.label}</span>
                <span className="text-[10px] text-muted-foreground">{v.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Custom
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={addCode}>
            <Code2 className="size-3.5 mr-2" />
            <div className="flex flex-col">
              <span className="text-xs">Code Scene</span>
              <span className="text-[10px] text-muted-foreground">Paste R3F / three.js JSX</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addGlb}>
            <Box className="size-3.5 mr-2" />
            <div className="flex flex-col">
              <span className="text-xs">GLB / glTF Model</span>
              <span className="text-[10px] text-muted-foreground">Load external 3D model</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted-foreground">
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
