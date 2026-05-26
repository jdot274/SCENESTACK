"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useScenes, type SceneWindow } from "@/lib/store"
import { SceneRenderer } from "./scene-renderer"
import { X, Copy, Lock, Unlock, Eye, EyeOff, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

const blendMap: Record<SceneWindow["blend"], string> = {
  normal: "normal",
  screen: "screen",
  multiply: "multiply",
  overlay: "overlay",
  difference: "difference",
  "color-dodge": "color-dodge",
}

export function SceneWindowView({ scene }: { scene: SceneWindow }) {
  const update = useScenes((s) => s.update)
  const remove = useScenes((s) => s.remove)
  const duplicate = useScenes((s) => s.duplicate)
  const bringToFront = useScenes((s) => s.bringToFront)
  const selectedId = useScenes((s) => s.selectedId)
  const isSelected = selectedId === scene.id

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{
    mode: "drag" | "resize" | null
    startX: number
    startY: number
    origX: number
    origY: number
    origW: number
    origH: number
  }>({ mode: null, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 })

  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback(
    (mode: "drag" | "resize") => (e: React.PointerEvent) => {
      if (scene.locked) return
      e.stopPropagation()
      bringToFront(scene.id)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      dragStateRef.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        origX: scene.x,
        origY: scene.y,
        origW: scene.width,
        origH: scene.height,
      }
      setDragging(true)
    },
    [scene, bringToFront],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const st = dragStateRef.current
      if (!st.mode) return
      const dx = e.clientX - st.startX
      const dy = e.clientY - st.startY
      if (st.mode === "drag") {
        update(scene.id, { x: st.origX + dx, y: st.origY + dy })
      } else {
        update(scene.id, {
          width: Math.max(220, st.origW + dx),
          height: Math.max(160, st.origH + dy),
        })
      }
    },
    [scene.id, update],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStateRef.current.mode) {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      dragStateRef.current.mode = null
      setDragging(false)
    }
  }, [])

  // keyboard nudge when selected
  useEffect(() => {
    if (!isSelected) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return
      const step = e.shiftKey ? 10 : 1
      if (e.key === "ArrowLeft") update(scene.id, { x: scene.x - step })
      else if (e.key === "ArrowRight") update(scene.id, { x: scene.x + step })
      else if (e.key === "ArrowUp") update(scene.id, { y: scene.y - step })
      else if (e.key === "ArrowDown") update(scene.id, { y: scene.y + step })
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (e.metaKey || e.ctrlKey) remove(scene.id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isSelected, scene.id, scene.x, scene.y, update, remove])

  if (!scene.visible) return null

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerDown={() => bringToFront(scene.id)}
      className={cn(
        "absolute rounded-lg overflow-hidden border shadow-2xl bg-card flex flex-col",
        isSelected ? "border-primary ring-2 ring-primary/40" : "border-border",
        dragging && "select-none",
      )}
      style={{
        left: scene.x,
        top: scene.y,
        width: scene.width,
        height: scene.height,
        zIndex: scene.zIndex,
        opacity: scene.opacity,
        mixBlendMode: blendMap[scene.blend] as React.CSSProperties["mixBlendMode"],
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={onPointerDown("drag")}
        className={cn(
          "h-8 flex items-center gap-1 px-2 bg-muted/80 backdrop-blur border-b border-border",
          scene.locked ? "cursor-not-allowed" : "cursor-move",
        )}
      >
        <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium truncate flex-1 font-mono">{scene.title}</span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-background/50">
          {scene.type}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            update(scene.id, { visible: !scene.visible })
          }}
          className="p-1 hover:bg-background/60 rounded"
          title="Hide"
        >
          {scene.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            update(scene.id, { locked: !scene.locked })
          }}
          className="p-1 hover:bg-background/60 rounded"
          title={scene.locked ? "Unlock" : "Lock"}
        >
          {scene.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            duplicate(scene.id)
          }}
          className="p-1 hover:bg-background/60 rounded"
          title="Duplicate"
        >
          <Copy className="size-3" />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            remove(scene.id)
          }}
          className="p-1 hover:bg-destructive/20 rounded"
          title="Close"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 relative">
        <SceneRenderer scene={scene} />
      </div>

      {/* Resize handle */}
      {!scene.locked && (
        <div
          onPointerDown={onPointerDown("resize")}
          className="absolute bottom-0 right-0 size-4 cursor-se-resize z-10"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, transparent 50%, var(--border) 50%, var(--border) 60%, transparent 60%, transparent 70%, var(--border) 70%, var(--border) 80%, transparent 80%)",
          }}
        />
      )}
    </div>
  )
}
