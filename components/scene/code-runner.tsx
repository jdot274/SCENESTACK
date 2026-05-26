"use client"

import { useMemo } from "react"
import * as THREE from "three"
import * as React from "react"
import * as R3F from "@react-three/fiber"
import * as Drei from "@react-three/drei"
import * as Babel from "@babel/standalone"

interface Props {
  code: string
  color: string
  speed: number
  onError?: (err: string | null) => void
}

/**
 * Runs user-supplied R3F/three.js JSX. The snippet should `return` JSX
 * representing scene contents (NO <Canvas> wrapper).
 *
 * Available globals: React, THREE, useFrame, useThree, useRef, useState,
 * useMemo, useEffect, drei (object with all @react-three/drei exports),
 * color, speed.
 */
export function CodeRunner({ code, color, speed, onError }: Props) {
  const Component = useMemo(() => {
    try {
      const wrapped = `
        const { useFrame, useThree } = R3F;
        const { useRef, useState, useMemo, useEffect } = React;
        return (function SceneFromCode() {
          ${code}
        });
      `
      const transpiled = Babel.transform(wrapped, {
        presets: ["react"],
        filename: "user-scene.jsx",
      }).code as string

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const factory = new Function("React", "THREE", "R3F", "drei", "color", "speed", transpiled)
      const Comp = factory(React, THREE, R3F, Drei, color, speed)
      onError?.(null)
      return Comp as React.ComponentType
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      onError?.(msg)
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, color, speed])

  if (!Component) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ef4444" wireframe />
      </mesh>
    )
  }

  return (
    <ErrorBoundary onError={onError}>
      <Component />
    </ErrorBoundary>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (msg: string | null) => void },
  { err: string | null }
> {
  state = { err: null as string | null }
  static getDerivedStateFromError(e: Error) {
    return { err: e.message }
  }
  componentDidCatch(e: Error) {
    this.props.onError?.(e.message)
  }
  render() {
    if (this.state.err) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ef4444" wireframe />
        </mesh>
      )
    }
    return this.props.children
  }
}

export const SAMPLE_CODE = `// Write JSX that returns scene contents.
// Available: React, THREE, R3F (useFrame, useThree), drei, color, speed
const ref = useRef();
useFrame((_, dt) => {
  if (ref.current) {
    ref.current.rotation.x += dt * speed;
    ref.current.rotation.y += dt * speed * 0.6;
  }
});
return (
  <group>
    <mesh ref={ref}>
      <dodecahedronGeometry args={[1.1, 0]} />
      <meshStandardMaterial color={color} flatShading metalness={0.4} roughness={0.3} />
    </mesh>
    <mesh position={[0, -1.6, 0]} rotation={[-Math.PI/2, 0, 0]}>
      <ringGeometry args={[1.4, 1.6, 64]} />
      <meshBasicMaterial color={color} />
    </mesh>
  </group>
);`
