"use client"

import { useEffect, useState } from "react"

export function FallingSnowballs({ enabled }: { enabled: boolean }) {
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; delay: number; duration: number; size: number }>
  >([])

  useEffect(() => {
    if (!enabled) {
      setSnowflakes([])
      return
    }

    const generateSnowflakes = () => {
      const newSnowflakes = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        size: 2 + Math.random() * 4,
      }))
      setSnowflakes(newSnowflakes)
    }

    generateSnowflakes()
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full opacity-40 animate-fall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            top: "-10px",
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0);
          }
          100% {
            transform: translateY(110vh) translateX(20px);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}
