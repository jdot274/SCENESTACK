"use client"

import { useScenes } from "@/lib/store"
import { ChevronUp, ChevronDown, Eye, EyeOff, Lock, Unlock, Trash2, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

export function LayersPanel() {
  const scenes = useScenes((s) => s.scenes)
  const selectedId = useScenes((s) => s.selectedId)
  const select = useScenes((s) => s.select)
  const bringToFront = useScenes((s) => s.bringToFront)
  const update = useScenes((s) => s.update)
  const remove = useScenes((s) => s.remove)
  const reorder = useScenes((s) => s.reorder)

  // Photoshop-style: top of list = top of z-stack
  const ordered = [...scenes].sort((a, b) => b.zIndex - a.zIndex)

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Layers className="size-4" />
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Layers</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{scenes.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {ordered.length === 0 && (
          <div className="p-4 text-xs text-muted-foreground text-center">
            No scenes yet. Add one from the toolbar →
          </div>
        )}
        {ordered.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              select(s.id)
              bringToFront(s.id)
            }}
            className={cn(
              "group flex items-center gap-1.5 px-2 py-2 border-b border-border cursor-pointer text-xs hover:bg-muted/50",
              selectedId === s.id && "bg-muted",
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                update(s.id, { visible: !s.visible })
              }}
              className="p-1 rounded hover:bg-background"
              title="Toggle visibility"
            >
              {s.visible ? <Eye className="size-3" /> : <EyeOff className="size-3 text-muted-foreground" />}
            </button>
            <div
              className="size-6 rounded border border-border shrink-0"
              style={{ background: s.background }}
            >
              <div
                className="size-full rounded"
                style={{ background: s.meshColor, opacity: 0.5, mixBlendMode: "screen" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono truncate">{s.title}</div>
              <div className="text-[9px] uppercase text-muted-foreground tracking-wider">
                {s.type} · {s.blend}
              </div>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  reorder(s.id, "up")
                }}
                className="p-1 rounded hover:bg-background"
                title="Bring forward"
              >
                <ChevronUp className="size-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  reorder(s.id, "down")
                }}
                className="p-1 rounded hover:bg-background"
                title="Send backward"
              >
                <ChevronDown className="size-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  update(s.id, { locked: !s.locked })
                }}
                className="p-1 rounded hover:bg-background"
                title={s.locked ? "Unlock" : "Lock"}
              >
                {s.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  remove(s.id)
                }}
                className="p-1 rounded hover:bg-destructive/20"
                title="Delete"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
