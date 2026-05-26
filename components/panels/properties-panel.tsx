"use client"

import { useScenes, type SceneWindow } from "@/lib/store"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Settings2, Code2, Box } from "lucide-react"
import { PRESETS } from "@/components/scene/presets"
import { useEffect, useState } from "react"

export function PropertiesPanel() {
  const scenes = useScenes((s) => s.scenes)
  const selectedId = useScenes((s) => s.selectedId)
  const update = useScenes((s) => s.update)
  const scene = scenes.find((s) => s.id === selectedId)

  if (!scene) {
    return (
      <div className="flex flex-col h-full border-l border-border bg-card">
        <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
          <Settings2 className="size-4" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Inspector</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Select a scene to edit
            <br />
            its properties.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Settings2 className="size-4" />
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground truncate">
          {scene.title}
        </span>
      </div>
      <Tabs defaultValue="props" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="m-2 grid grid-cols-3">
          <TabsTrigger value="props" className="text-xs">
            <Box className="size-3 mr-1" /> Props
          </TabsTrigger>
          <TabsTrigger value="layer" className="text-xs">
            <Settings2 className="size-3 mr-1" /> Layer
          </TabsTrigger>
          <TabsTrigger value="source" className="text-xs">
            <Code2 className="size-3 mr-1" /> Source
          </TabsTrigger>
        </TabsList>

        <TabsContent value="props" className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 mt-0">
          <PropsTab scene={scene} update={update} />
        </TabsContent>

        <TabsContent value="layer" className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 mt-0">
          <LayerTab scene={scene} update={update} />
        </TabsContent>

        <TabsContent value="source" className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 mt-0">
          <SourceTab scene={scene} update={update} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</Label>
      {children}
    </div>
  )
}

function PropsTab({
  scene,
  update,
}: {
  scene: SceneWindow
  update: (id: string, p: Partial<SceneWindow>) => void
}) {
  return (
    <>
      <Row label="Title">
        <Input
          value={scene.title}
          onChange={(e) => update(scene.id, { title: e.target.value })}
          className="h-8 text-xs"
        />
      </Row>
      {scene.type === "preset" && (
        <Row label="Preset">
          <Select
            value={scene.presetId}
            onValueChange={(v) => update(scene.id, { presetId: v as SceneWindow["presetId"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      )}
      <Row label="Mesh Color">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={scene.meshColor}
            onChange={(e) => update(scene.id, { meshColor: e.target.value })}
            className="size-8 rounded border border-border bg-transparent cursor-pointer"
          />
          <Input
            value={scene.meshColor}
            onChange={(e) => update(scene.id, { meshColor: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </Row>
      <Row label="Background">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={scene.background.startsWith("#") ? scene.background : "#000000"}
            onChange={(e) => update(scene.id, { background: e.target.value })}
            className="size-8 rounded border border-border bg-transparent cursor-pointer"
          />
          <Input
            value={scene.background}
            onChange={(e) => update(scene.id, { background: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </Row>
      <Row label={`Rotation Speed: ${scene.rotationSpeed.toFixed(2)}`}>
        <Slider
          value={[scene.rotationSpeed]}
          min={0}
          max={3}
          step={0.05}
          onValueChange={([v]) => update(scene.id, { rotationSpeed: v })}
        />
      </Row>
      <Row label={`Camera FOV: ${scene.cameraFov}°`}>
        <Slider
          value={[scene.cameraFov]}
          min={20}
          max={90}
          step={1}
          onValueChange={([v]) => update(scene.id, { cameraFov: v })}
        />
      </Row>
      <Row label={`Ambient Light: ${scene.ambient.toFixed(2)}`}>
        <Slider
          value={[scene.ambient]}
          min={0}
          max={2}
          step={0.05}
          onValueChange={([v]) => update(scene.id, { ambient: v })}
        />
      </Row>
      <Row label={`Directional Light: ${scene.directional.toFixed(2)}`}>
        <Slider
          value={[scene.directional]}
          min={0}
          max={3}
          step={0.05}
          onValueChange={([v]) => update(scene.id, { directional: v })}
        />
      </Row>
    </>
  )
}

function LayerTab({
  scene,
  update,
}: {
  scene: SceneWindow
  update: (id: string, p: Partial<SceneWindow>) => void
}) {
  return (
    <>
      <Row label={`Opacity: ${Math.round(scene.opacity * 100)}%`}>
        <Slider
          value={[scene.opacity]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => update(scene.id, { opacity: v })}
        />
      </Row>
      <Row label="Blend Mode">
        <Select value={scene.blend} onValueChange={(v) => update(scene.id, { blend: v as SceneWindow["blend"] })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["normal", "screen", "multiply", "overlay", "difference", "color-dodge"] as const).map((m) => (
              <SelectItem key={m} value={m} className="text-xs">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="X">
          <Input
            type="number"
            value={Math.round(scene.x)}
            onChange={(e) => update(scene.id, { x: Number(e.target.value) })}
            className="h-8 text-xs font-mono"
          />
        </Row>
        <Row label="Y">
          <Input
            type="number"
            value={Math.round(scene.y)}
            onChange={(e) => update(scene.id, { y: Number(e.target.value) })}
            className="h-8 text-xs font-mono"
          />
        </Row>
        <Row label="W">
          <Input
            type="number"
            value={Math.round(scene.width)}
            onChange={(e) => update(scene.id, { width: Math.max(220, Number(e.target.value)) })}
            className="h-8 text-xs font-mono"
          />
        </Row>
        <Row label="H">
          <Input
            type="number"
            value={Math.round(scene.height)}
            onChange={(e) => update(scene.id, { height: Math.max(160, Number(e.target.value)) })}
            className="h-8 text-xs font-mono"
          />
        </Row>
      </div>
    </>
  )
}

function SourceTab({
  scene,
  update,
}: {
  scene: SceneWindow
  update: (id: string, p: Partial<SceneWindow>) => void
}) {
  const [draft, setDraft] = useState("")
  useEffect(() => {
    if (scene.type === "code") setDraft(scene.code ?? "")
    else if (scene.type === "threejs") setDraft(scene.threeCode ?? "")
    else if (scene.type === "webgl2") setDraft(scene.glCode ?? "")
    else if (scene.type === "shader") setDraft(scene.shaderCode ?? "")
    else if (scene.type === "html") setDraft(scene.htmlCode ?? "")
    else setDraft("")
  }, [scene.id, scene.type, scene.code, scene.threeCode, scene.glCode, scene.shaderCode, scene.htmlCode])

  const apply = () => {
    if (scene.type === "code") update(scene.id, { code: draft })
    else if (scene.type === "threejs") update(scene.id, { threeCode: draft })
    else if (scene.type === "webgl2") update(scene.id, { glCode: draft })
    else if (scene.type === "shader") update(scene.id, { shaderCode: draft })
    else if (scene.type === "html") update(scene.id, { htmlCode: draft })
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>, kind: "glb" | "usd") => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (kind === "glb") update(scene.id, { glbUrl: url, title: file.name })
    else update(scene.id, { usdUrl: url, usdName: file.name, title: file.name })
  }

  if (scene.type === "code") {
    return (
      <>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Paste R3F / three.js JSX. Available globals:{" "}
          <code className="text-foreground">React, THREE, R3F, drei, color, speed</code>. Return JSX (no
          &lt;Canvas&gt;).
        </p>
        <CodeEditor draft={draft} setDraft={setDraft} onApply={apply} onReset={() => setDraft(scene.code ?? "")} />
      </>
    )
  }

  if (scene.type === "threejs") {
    return (
      <>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Raw Three.js module. You receive <code className="text-foreground">{"{ THREE, scene, camera, renderer, container }"}</code>. Return{" "}
          <code className="text-foreground">{"{ tick?, dispose? }"}</code>.
        </p>
        <CodeEditor
          draft={draft}
          setDraft={setDraft}
          onApply={apply}
          onReset={() => setDraft(scene.threeCode ?? "")}
        />
      </>
    )
  }

  if (scene.type === "webgl2") {
    return (
      <>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Raw WebGL2. You receive <code className="text-foreground">{"{ gl, canvas }"}</code>. Return{" "}
          <code className="text-foreground">{"{ tick?, dispose? }"}</code>.
        </p>
        <CodeEditor draft={draft} setDraft={setDraft} onApply={apply} onReset={() => setDraft(scene.glCode ?? "")} />
      </>
    )
  }

  if (scene.type === "shader") {
    return (
      <>
        <Row label="Shader Language">
          <Select
            value={scene.shaderLang ?? "glsl"}
            onValueChange={(v) => update(scene.id, { shaderLang: v as "glsl" | "wgsl" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="glsl" className="text-xs">
                GLSL (WebGL)
              </SelectItem>
              <SelectItem value="wgsl" className="text-xs">
                WGSL (preview)
              </SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Fragment shader. Uniforms: <code className="text-foreground">u_time, u_resolution, u_mouse</code>. Varying:{" "}
          <code className="text-foreground">vUv</code>. WGSL is a preview placeholder — WebGL contexts can&apos;t
          execute WGSL natively.
        </p>
        <CodeEditor
          draft={draft}
          setDraft={setDraft}
          onApply={apply}
          onReset={() => setDraft(scene.shaderCode ?? "")}
        />
      </>
    )
  }

  if (scene.type === "glb") {
    return (
      <>
        <Row label="Model URL (.glb / .gltf)">
          <Input
            value={scene.glbUrl ?? ""}
            onChange={(e) => update(scene.id, { glbUrl: e.target.value })}
            placeholder="/assets/3d/duck.glb"
            className="h-8 font-mono text-xs"
          />
        </Row>
        <Row label="Or Upload File">
          <Input type="file" accept=".glb,.gltf" onChange={(e) => onFile(e, "glb")} className="h-8 text-xs" />
        </Row>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          The bundled sample <code>/assets/3d/duck.glb</code> is available for testing.
        </p>
      </>
    )
  }

  if (scene.type === "usd") {
    return (
      <>
        <Row label="Model URL (.usdz)">
          <Input
            value={scene.usdUrl ?? ""}
            onChange={(e) => update(scene.id, { usdUrl: e.target.value, usdName: scene.usdName ?? "scene.usdz" })}
            placeholder="https://example.com/scene.usdz"
            className="h-8 font-mono text-xs"
          />
        </Row>
        <Row label="Or Upload File">
          <Input type="file" accept=".usdz,.usd,.usda,.usdc" onChange={(e) => onFile(e, "usd")} className="h-8 text-xs" />
        </Row>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          USDZ uses three.js&apos;s experimental loader. Native <code>.usd/.usda/.usdc</code> requires a WASM-based
          loader (e.g. <code>three-usdz-loader</code>). For best compatibility convert to USDZ or GLB.
        </p>
      </>
    )
  }

  if (scene.type === "spline") {
    return (
      <>
        <Row label="Spline Scene URL (.splinecode)">
          <Input
            value={scene.splineUrl ?? ""}
            onChange={(e) => update(scene.id, { splineUrl: e.target.value })}
            placeholder="https://prod.spline.design/.../scene.splinecode"
            className="h-8 font-mono text-xs"
          />
        </Row>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Export from Spline → Code Export → React, then paste the <code>.splinecode</code> URL above.
        </p>
      </>
    )
  }

  if (scene.type === "html") {
    return (
      <>
        <Row label="Render Mode">
          <Select
            value={scene.htmlMode ?? "iframe"}
            onValueChange={(v) => update(scene.id, { htmlMode: v as "iframe" | "texture" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iframe" className="text-xs">
                Sandboxed iframe (interactive)
              </SelectItem>
              <SelectItem value="texture" className="text-xs">
                Rasterize to 3D texture
              </SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          CodePen-style HTML/CSS/JS bundle. iframe mode runs sandboxed (allow-scripts only). Texture mode rasterizes
          the iframe and projects it onto a 3D plane.
        </p>
        <CodeEditor draft={draft} setDraft={setDraft} onApply={apply} onReset={() => setDraft(scene.htmlCode ?? "")} />
      </>
    )
  }

  return (
    <p className="text-xs text-muted-foreground">
      This is a built-in preset. Switch the preset in the Props tab, or duplicate this layer as a Code layer to edit
      source.
    </p>
  )
}

function CodeEditor({
  draft,
  setDraft,
  onApply,
  onReset,
}: {
  draft: string
  setDraft: (v: string) => void
  onApply: () => void
  onReset: () => void
}) {
  return (
    <>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="min-h-[280px] font-mono text-[11px] leading-relaxed"
        spellCheck={false}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onApply} className="h-8 flex-1 text-xs">
          Apply
        </Button>
        <Button size="sm" variant="outline" onClick={onReset} className="h-8 text-xs bg-transparent">
          Reset
        </Button>
      </div>
    </>
  )
}
