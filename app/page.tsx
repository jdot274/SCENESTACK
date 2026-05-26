import { Toolbar } from "@/components/toolbar"
import { Workspace } from "@/components/workspace"
import { LayersPanel } from "@/components/panels/layers-panel"
import { PropertiesPanel } from "@/components/panels/properties-panel"

export default function Page() {
  return (
    <main className="dark h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <aside className="w-60 shrink-0">
          <LayersPanel />
        </aside>
        <Workspace />
        <aside className="w-72 shrink-0">
          <PropertiesPanel />
        </aside>
      </div>
    </main>
  )
}
