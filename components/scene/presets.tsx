"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface PresetProps {
  color: string
  speed: number
}

export function ShaderPlasma({ color, speed }: PresetProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt * speed
  })
  const c = new THREE.Color(color)
  return (
    <mesh>
      <icosahedronGeometry args={[1.2, 64]} />
      <shaderMaterial
        ref={matRef}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        }}
        vertexShader={`
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
            vPos = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
            float n = sin(vPos.x * 4.0 + uTime) * cos(vPos.y * 4.0 + uTime * 0.7) * sin(vPos.z * 4.0 - uTime * 0.5);
            vec3 col = uColor * (0.5 + 0.5 * n);
            float fres = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
            col += fres * 0.4;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export function ShaderFresnel({ color, speed }: PresetProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt
    if (meshRef.current) meshRef.current.rotation.y += dt * speed
  })
  const c = new THREE.Color(color)
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDir = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
            vec3 col = mix(uColor * 0.1, uColor + vec3(0.5), fres);
            col += sin(uTime + fres * 6.28) * 0.05;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export function TorusKnot({ color, speed }: PresetProps) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * speed
      ref.current.rotation.y += dt * speed * 0.7
    }
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.9, 0.3, 200, 32]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
    </mesh>
  )
}

export function WobbleSphere({ color, speed }: PresetProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt * speed
  })
  const c = new THREE.Color(color)
  return (
    <mesh>
      <icosahedronGeometry args={[1.2, 32]} />
      <shaderMaterial
        ref={matRef}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        }}
        vertexShader={`
          uniform float uTime;
          varying vec3 vNormal;
          varying float vWob;
          void main() {
            float w = sin(position.x * 3.0 + uTime) * 0.15 + cos(position.y * 4.0 + uTime) * 0.1;
            vec3 p = position + normal * w;
            vWob = w;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying float vWob;
          void main() {
            float l = max(dot(vNormal, normalize(vec3(0.5, 0.8, 0.6))), 0.0);
            vec3 col = uColor * (0.3 + l) + vWob;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export function Particles({ color, speed }: PresetProps) {
  const ref = useRef<THREE.Points>(null)
  const count = 1500
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 0.5 + Math.random() * 1.4
    const t = Math.random() * Math.PI * 2
    const p = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(p) * Math.cos(t)
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t)
    positions[i * 3 + 2] = r * Math.cos(p)
  }
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} sizeAttenuation transparent opacity={0.9} />
    </points>
  )
}

export function DisplacedPlane({ color, speed }: PresetProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt * speed
  })
  const c = new THREE.Color(color)
  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[3, 3, 80, 80]} />
      <shaderMaterial
        ref={matRef}
        wireframe
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        }}
        vertexShader={`
          uniform float uTime;
          varying float vH;
          void main() {
            float h = sin(position.x * 2.0 + uTime) * 0.3 + cos(position.y * 2.0 + uTime * 1.3) * 0.2;
            vH = h;
            vec3 p = vec3(position.x, position.y, h);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vH;
          void main() {
            gl_FragColor = vec4(uColor * (0.5 + vH), 1.0);
          }
        `}
      />
    </mesh>
  )
}

export const PRESETS: Record<
  string,
  { label: string; component: (p: PresetProps) => JSX.Element; description: string }
> = {
  "shader-plasma": {
    label: "Plasma Shader",
    description: "Custom GLSL shader on icosahedron",
    component: (p) => <ShaderPlasma {...p} />,
  },
  "shader-fresnel": {
    label: "Fresnel Sphere",
    description: "Edge-lit GLSL sphere",
    component: (p) => <ShaderFresnel {...p} />,
  },
  "torus-knot": {
    label: "Metal Knot",
    description: "PBR metallic torus knot",
    component: (p) => <TorusKnot {...p} />,
  },
  "wobble-sphere": {
    label: "Wobble Sphere",
    description: "Vertex-displaced icosahedron",
    component: (p) => <WobbleSphere {...p} />,
  },
  particles: {
    label: "Particles",
    description: "1500 GPU points orbiting",
    component: (p) => <Particles {...p} />,
  },
  "displaced-plane": {
    label: "Wireframe Plane",
    description: "Animated wireframe terrain",
    component: (p) => <DisplacedPlane {...p} />,
  },
}
