"use client"

import { Text } from "@react-three/drei"
import type { SceneObject } from "@/lib/store"

function MeshGeometry({ kind }: { kind: SceneObject["kind"] }) {
  switch (kind) {
    case "box":
      return <boxGeometry args={[1, 1, 1]} />
    case "sphere":
      return <sphereGeometry args={[0.5, 32, 32]} />
    case "torus":
      return <torusGeometry args={[0.4, 0.15, 16, 64]} />
    case "cone":
      return <coneGeometry args={[0.5, 1, 32]} />
    case "plane":
      return <planeGeometry args={[1, 1]} />
    case "cylinder":
      return <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
    default:
      return null
  }
}

function ObjectNode({ object }: { object: SceneObject }) {
  if (!object.visible) return null

  if (object.kind === "pointLight") {
    return (
      <pointLight
        position={object.position}
        color={object.color}
        intensity={object.intensity ?? 1}
        distance={10}
      />
    )
  }
  if (object.kind === "spotLight") {
    return (
      <spotLight
        position={object.position}
        color={object.color}
        intensity={object.intensity ?? 2}
        angle={0.5}
        penumbra={0.4}
      />
    )
  }
  if (object.kind === "text") {
    return (
      <Text
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        color={object.color}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {object.text ?? "Hello"}
      </Text>
    )
  }

  return (
    <mesh
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      castShadow
      receiveShadow
    >
      <MeshGeometry kind={object.kind} />
      <meshStandardMaterial
        color={object.color}
        metalness={object.metalness ?? 0.1}
        roughness={object.roughness ?? 0.5}
        wireframe={object.wireframe ?? false}
      />
    </mesh>
  )
}

export function SceneObjects({ objects }: { objects: SceneObject[] }) {
  return (
    <>
      {objects.map((o) => (
        <ObjectNode key={o.id} object={o} />
      ))}
    </>
  )
}
