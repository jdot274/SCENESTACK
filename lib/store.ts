"use client"

import { create } from "zustand"

export type SceneType =
  | "preset"
  | "code"
  | "glb"
  | "threejs"
  | "shader"
  | "webgl2"
  | "usd"
  | "spline"
  | "html"

export type PresetId =
  | "shader-plasma"
  | "shader-fresnel"
  | "torus-knot"
  | "wobble-sphere"
  | "particles"
  | "displaced-plane"

export type ShaderLang = "glsl" | "wgsl"
export type HtmlMode = "iframe" | "texture"

export type ObjectKind =
  | "box"
  | "sphere"
  | "torus"
  | "cone"
  | "plane"
  | "cylinder"
  | "text"
  | "pointLight"
  | "spotLight"

export interface SceneObject {
  id: string
  kind: ObjectKind
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  intensity?: number
  text?: string
  metalness?: number
  roughness?: number
  wireframe?: boolean
  visible: boolean
}

export interface SceneWindow {
  id: string
  title: string
  type: SceneType
  presetId?: PresetId
  code?: string
  threeCode?: string
  glCode?: string
  shaderCode?: string
  shaderLang?: ShaderLang
  glbUrl?: string
  usdUrl?: string
  usdName?: string
  splineUrl?: string
  htmlCode?: string
  htmlMode?: HtmlMode
  // layout
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
  // scene-level transform
  sceneRotation: [number, number, number]
  scenePosition: [number, number, number]
  sceneScale: number
  // user-added primitives layered into the scene
  objects: SceneObject[]
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
  addObject: (sceneId: string, kind: ObjectKind) => string
  updateObject: (sceneId: string, objectId: string, patch: Partial<SceneObject>) => void
  removeObject: (sceneId: string, objectId: string) => void
  duplicateObject: (sceneId: string, objectId: string) => void
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
  sceneRotation: [0, 0, 0],
  scenePosition: [0, 0, 0],
  sceneScale: 1,
  objects: [],
}

const objectDefaults: Record<ObjectKind, Partial<SceneObject>> = {
  box: { color: "#f97316", scale: [1, 1, 1] },
  sphere: { color: "#a855f7", scale: [0.8, 0.8, 0.8] },
  torus: { color: "#22d3ee", scale: [0.7, 0.7, 0.7] },
  cone: { color: "#facc15", scale: [0.8, 1, 0.8] },
  plane: { color: "#94a3b8", scale: [2, 2, 1], rotation: [-Math.PI / 2, 0, 0] },
  cylinder: { color: "#10b981", scale: [0.6, 1, 0.6] },
  text: { color: "#ffffff", text: "Hello", scale: [1, 1, 1] },
  pointLight: { color: "#ffffff", intensity: 1 },
  spotLight: { color: "#ffffff", intensity: 2 },
}

function makeObject(kind: ObjectKind): SceneObject {
  const id = `o_${Date.now().toString(36)}_${(counter++).toString(36)}`
  const base: SceneObject = {
    id,
    kind,
    name: kind.charAt(0).toUpperCase() + kind.slice(1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffffff",
    metalness: 0.1,
    roughness: 0.5,
    wireframe: false,
    visible: true,
  }
  return { ...base, ...objectDefaults[kind] } as SceneObject
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
      objects: s.objects ?? [],
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
  addObject: (sceneId, kind) => {
    const obj = makeObject(kind)
    set((st) => ({
      scenes: st.scenes.map((s) =>
        s.id === sceneId ? { ...s, objects: [...(s.objects ?? []), obj] } : s,
      ),
    }))
    return obj.id
  },
  updateObject: (sceneId, objectId, patch) =>
    set((st) => ({
      scenes: st.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, objects: (s.objects ?? []).map((o) => (o.id === objectId ? { ...o, ...patch } : o)) }
          : s,
      ),
    })),
  removeObject: (sceneId, objectId) =>
    set((st) => ({
      scenes: st.scenes.map((s) =>
        s.id === sceneId ? { ...s, objects: (s.objects ?? []).filter((o) => o.id !== objectId) } : s,
      ),
    })),
  duplicateObject: (sceneId, objectId) =>
    set((st) => ({
      scenes: st.scenes.map((s) => {
        if (s.id !== sceneId) return s
        const list = s.objects ?? []
        const src = list.find((o) => o.id === objectId)
        if (!src) return s
        const newId = `o_${Date.now().toString(36)}_${(counter++).toString(36)}`
        const copy: SceneObject = {
          ...src,
          id: newId,
          name: src.name + " copy",
          position: [src.position[0] + 0.3, src.position[1], src.position[2] + 0.3],
        }
        return { ...s, objects: [...list, copy] }
      }),
    })),
}))
