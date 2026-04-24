'use client'

import { useEffect, useRef } from 'react'

export default function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current || effectRef.current) return

      const THREE = await import('three')
      // @ts-expect-error vanta has no types
      const VANTA = (await import('vanta/dist/vanta.net.min')).default

      effectRef.current = VANTA({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x5c05b3,
        backgroundColor: 0x0b0916,
        points: 13,
        maxDistance: 22,
      })
    }

    init()

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 -z-10" />
}
