'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useTheme } from 'next-themes'

declare global {
  interface Window {
    VANTA: {
      FOG: (config: Record<string, unknown>) => { destroy: () => void }
      WAVES: (config: Record<string, unknown>) => { destroy: () => void }
    }
    THREE: unknown
  }
}

export default function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)
  const [threeReady, setThreeReady] = useState(false)
  const [fogReady, setFogReady] = useState(false)
  const [wavesReady, setWavesReady] = useState(false)
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme !== 'light'

  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.destroy()
      effectRef.current = null
    }
    if (!containerRef.current) return

    if (isDark && threeReady && fogReady && window.VANTA?.FOG) {
      try {
        effectRef.current = window.VANTA.FOG({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0x372748,
          midtoneColor: 0x302ac3,
          lowlightColor: 0x7cacfc,
          baseColor: 0x50505,
          blurFactor: 0.62,
          speed: 1.30,
          zoom: 3.00,
        })
      } catch (e) {
        console.warn('Vanta FOG error:', e)
      }
    } else if (!isDark && threeReady && wavesReady && window.VANTA?.WAVES) {
      try {
        effectRef.current = window.VANTA.WAVES({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x1d62ac,
          shininess: 125.00,
          waveHeight: 18.00,
          waveSpeed: 0.70,
          zoom: 0.65,
        })
      } catch (e) {
        console.warn('Vanta WAVES error:', e)
      }
    }
  }, [threeReady, fogReady, wavesReady, isDark])

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
        <>
          <Script
            src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js"
            strategy="afterInteractive"
            onLoad={() => setFogReady(true)}
          />
          <Script
            src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js"
            strategy="afterInteractive"
            onLoad={() => setWavesReady(true)}
          />
        </>
      )}
      <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }} />
    </>
  )
}
