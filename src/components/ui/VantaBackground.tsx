'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    VANTA: { FOG: (config: Record<string, unknown>) => { destroy: () => void } }
    THREE: unknown
  }
}

export default function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)
  const [threeReady, setThreeReady] = useState(false)
  const [vantaReady, setVantaReady] = useState(false)

  useEffect(() => {
    if (!threeReady || !vantaReady || !containerRef.current || effectRef.current) return
    if (!window.VANTA?.FOG) return

    try {
      effectRef.current = window.VANTA.FOG({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        highlightColor: 0x2f002f,
        midtoneColor: 0x442982,
        lowlightColor: 0xb033e,
        baseColor: 0x70404,
        blurFactor: 0.24,
        speed: 0.00,
        zoom: 1.40,
      })
    } catch (e) {
      console.warn('Vanta error:', e)
    }
  }, [threeReady, vantaReady])

  useEffect(() => {
    return () => {
      if (effectRef.current) {
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setThreeReady(true)}
      />
      {threeReady && (
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js"
          strategy="afterInteractive"
          onLoad={() => setVantaReady(true)}
        />
      )}
      <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }} />
    </>
  )
}
