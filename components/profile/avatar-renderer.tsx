"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Float, ContactShadows, Environment } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import type { AvatarConfig } from "@/lib/avatar-config"
import { isWebGLAvailable, getWebGLErrorMessage } from "@/lib/webgl-utils"
import { WebGLErrorBoundary } from "./webgl-error-boundary"
import { Loader2 } from "lucide-react"

function AvatarBody({ config }: { config: AvatarConfig }) {
  return (
    <group>
      {/* Head with more definition */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Expressive Eyes */}
      <group position={[0, 1.55, 0.35]}>
        <mesh position={[-0.12, 0, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
      </group>

      {/* Tech-Neck Join */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>

      {/* Body / Outfit with more volume */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.9, 8, 16]} />
        <meshStandardMaterial
          color={config.outfit === "techwear" ? "#0a0a0a" : "#1a1a1a"}
          metalness={0.6}
          roughness={0.2}
          emissive={config.outfit === "techwear" ? "#00f3ff" : "#000"}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Stylized Hair with Volume */}
      <mesh position={[0, 1.7, -0.05]} castShadow>
        <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
        <meshStandardMaterial color={config.hairColor} roughness={0.8} />
      </mesh>
    </group>
  )
}

function AvatarFallback({ config }: { config: AvatarConfig }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-background rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Stylized 2D avatar representation */}
      <div className="relative">
        {/* Head */}
        <div
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/10 shadow-2xl"
          style={{
            backgroundColor: config.skinTone,
            boxShadow: `0 0 40px ${config.skinTone}40`,
          }}
        >
          {/* Eyes */}
          <div className="absolute top-12 left-8 w-4 h-4 rounded-full bg-foreground/80" />
          <div className="absolute top-12 right-8 w-4 h-4 rounded-full bg-foreground/80" />
        </div>

        {/* Body/Outfit indicator */}
        <div className="w-40 h-24 mx-auto rounded-t-full bg-gradient-to-b from-muted to-muted/50 border border-white/10" />

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl animate-pulse delay-75" />
      </div>

      {/* Status text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground opacity-50">
          2D Fallback Mode
        </p>
      </div>
    </div>
  )
}

function AvatarLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-3xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50 mx-auto mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Initializing 3D Engine
        </p>
      </div>
    </div>
  )
}

export function AvatarRenderer({ config, interactive = false }: { config: AvatarConfig; interactive?: boolean }) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Explicit check for WebGL support on mount
    setWebglSupported(isWebGLAvailable())
  }, [retryCount])

  if (webglSupported === null) {
    return <AvatarLoading />
  }

  if (!webglSupported) {
    return (
      <div className="w-full h-full relative">
        <AvatarFallback config={config} />
        <div className="absolute top-4 right-4 group">
          <div className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-full font-mono cursor-help">
            !
            <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-card border border-white/10 rounded-2xl p-4 text-xs text-muted-foreground shadow-2xl z-10">
              {getWebGLErrorMessage()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <WebGLErrorBoundary
        fallback={<AvatarFallback config={config} />}
        onReset={() => setRetryCount((prev) => prev + 1)}
      >
        <Canvas
          shadows
          dpr={[1, 1.5]} // Reduced DPR for better stability on older Intel GPUs
          gl={{
            antialias: false, // Disabled antialias for maximum hardware compatibility
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false, // Ensure it tries to run even with performance warnings
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            console.log("[v0] WebGL context created successfully")
          }}
          onError={(error) => {
            console.error("[v0] Canvas Context Error:", error)
            setWebglSupported(false) // Gracefully degrade to 2D if initialization fails
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 1.3, 3]} fov={35} />
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <ambientLight intensity={0.8} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f3ff" />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#ff00ff" />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <AvatarBody config={config} />
            </Float>

            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />

            {interactive && (
              <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} />
            )}
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}
