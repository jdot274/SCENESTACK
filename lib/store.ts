"use client"

import { create } from "zustand"

export type SceneType = "preset" | "code" | "glb"

export type PresetId =
  | "shader-plasma"
  | "shader-fresnel"
  | "torus-knot"
  | "wobble-sphere"
  | "particles"
  | "displaced-plane"

export interface SceneWindow {
  id: string
  title: string
  type: SceneType
  presetId?: PresetId
  code?: string
  glbUrl?: string
  // layout (window position + size in workspace)
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  // visibility
  visible: boolean
  locked: boolean
  opacity: number
  blend: "normal" | "screen" | "multiply" | "overlay" | "difference" | "color-dodge"
  // scene params
  background: string
  cameraFov: number
  rotationSpeed: number
  meshColor: string
  ambient: number
  directional: number
}

interface State {
  scenes: SceneWindow[]
  selectedId: string | null
  zCounter: number
  add: (s: Partial<SceneWindow> & Pick<SceneWindow, "type">) => string
  remove: (id: string) => void
  update: (id: string, patch: Partial<SceneWindow>) => void
  select: (id: string | null) => void
  bringToFront: (id: string) => void
  reorder: (id: string, direction: "up" | "down") => void
  duplicate: (id: string) => void
}

let counter = 0
const nextId = () => `s_${Date.now().toString(36)}_${(counter++).toString(36)}`

const defaults: Omit<SceneWindow, "id" | "type" | "title"> = {
  x: 80,
  y: 80,
  width: 420,
  height: 320,
  zIndex: 1,
  visible: true,
  locked: false,
  opacity: 1,
  blend: "normal",
  background: "#0b0b10",
  cameraFov: 50,
  rotationSpeed: 0.3,
  meshColor: "#7dd3fc",
  ambient: 0.4,
  directional: 1.2,
}

export const useScenes = create<State>((set, get) => ({
  scenes: [],
  selectedId: null,
  zCounter: 1,
  add: (s) => {
    const id = nextId()
    const z = get().zCounter + 1
    const offset = get().scenes.length * 24
    const scene: SceneWindow = {
      ...defaults,
      x: defaults.x + offset,
      y: defaults.y + offset,
      title: s.title ?? "Untitled",
      ...s,
      id,
      zIndex: z,
    } as SceneWindow
    set((st) => ({ scenes: [...st.scenes, scene], selectedId: id, zCounter: z }))
    return id
  },
  remove: (id) =>
    set((st) => ({
      scenes: st.scenes.filter((s) => s.id !== id),
      selectedId: st.selectedId === id ? null : st.selectedId,
    })),
  update: (id, patch) =>
    set((st) => ({
      scenes: st.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  select: (id) => set({ selectedId: id }),
  bringToFront: (id) => {
    const z = get().zCounter + 1
    set((st) => ({
      zCounter: z,
      scenes: st.scenes.map((s) => (s.id === id ? { ...s, zIndex: z } : s)),
      selectedId: id,
    }))
  },
  reorder: (id, dir) => {
    const list = [...get().scenes].sort((a, b) => a.zIndex - b.zIndex)
    const idx = list.findIndex((s) => s.id === id)
    if (idx < 0) return
    const swapWith = dir === "up" ? idx + 1 : idx - 1
    if (swapWith < 0 || swapWith >= list.length) return
    const a = list[idx]
    const b = list[swapWith]
    const az = a.zIndex
    set((st) => ({
      scenes: st.scenes.map((s) => {
        if (s.id === a.id) return { ...s, zIndex: b.zIndex }
        if (s.id === b.id) return { ...s, zIndex: az }
        return s
      }),
    }))
  },
  duplicate: (id) => {
    const src = get().scenes.find((s) => s.id === id)
    if (!src) return
    const newId = nextId()
    const z = get().zCounter + 1
    set((st) => ({
      zCounter: z,
      scenes: [
        ...st.scenes,
        { ...src, id: newId, title: src.title + " copy", x: src.x + 24, y: src.y + 24, zIndex: z },
      ],
      selectedId: newId,
    }))
  },
}))
