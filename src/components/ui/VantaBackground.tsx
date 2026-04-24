'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    VANTA: { NET: (config: Record<string, unknown>) => { destroy: () => void } }
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
    if (!window.VANTA?.NET) return

    try {
      effectRef.current = window.VANTA.NET({
        el: containerRef.current,
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
          src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js"
          strategy="afterInteractive"
          onLoad={() => setVantaReady(true)}
        />
      )}
      <div ref={containerRef} className="fixed inset-0 -z-10 w-full h-full" />
    </>
  )
}
