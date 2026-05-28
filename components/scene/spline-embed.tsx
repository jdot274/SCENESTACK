"use client"

import dynamic from "next/dynamic"

/**
 * Spline scene embed. Accepts a public Spline scene URL (e.g. ending in .splinecode).
 * The runtime is loaded dynamically to keep it out of the initial bundle.
 */
const Spline = dynamic(
  () => import("@splinetool/react-spline").then((m) => m.default),
  { ssr: false, loading: () => <div className="animate-pulse h-full w-full bg-muted/20" /> }
)

export function SplineEmbed({ url }: { url: string }) {
  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Paste a Spline scene URL (.splinecode) in the properties panel to embed.
      </div>
    )
  }
  return (
    <div className="h-full w-full">
      <Spline scene={url} />
    </div>
  )
}
