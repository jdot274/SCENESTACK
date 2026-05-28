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
  const [draft, setDraft] = useState(scene.code ?? "")
  useEffect(() => {
    setDraft(scene.code ?? "")
  }, [scene.id, scene.code])

  if (scene.type === "code") {
    return (
      <>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Paste R3F / three.js JSX. Available globals:{" "}
          <code className="text-foreground">React, THREE, R3F, drei, color, speed</code>. Return JSX (no &lt;Canvas&gt;).
        </p>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="font-mono text-[11px] min-h-[280px] leading-relaxed"
          spellCheck={false}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => update(scene.id, { code: draft })} className="flex-1 h-8 text-xs">
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDraft(scene.code ?? "")}
            className="h-8 text-xs"
          >
            Reset
          </Button>
        </div>
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
            className="h-8 text-xs font-mono"
          />
        </Row>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          USD/USDZ are not natively supported in three.js. Convert to <code>.glb</code> first (e.g. via{" "}
          <code>usd2gltf</code>). The bundled sample <code>/assets/3d/duck.glb</code> is available.
        </p>
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
