'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useTheme } from 'next-themes'

declare global {
  interface Window {
    VANTA: {
      FOG: (config: Record<string, unknown>) => { destroy: () => void }
      CLOUDS: (config: Record<string, unknown>) => { destroy: () => void }
    }
    THREE: unknown
  }
}

export default function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)
  const [threeReady, setThreeReady] = useState(false)
  const [fogReady, setFogReady] = useState(false)
  const [cloudsReady, setCloudsReady] = useState(false)
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
    } else if (!isDark && threeReady && cloudsReady && window.VANTA?.CLOUDS) {
      try {
        effectRef.current = window.VANTA.CLOUDS({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          skyColor: 0x71acff,
          cloudShadowColor: 0x1c63a7,
          sunColor: 0xafa1ed,
          sunGlareColor: 0xc9defa,
          sunlightColor: 0x97d5f7,
          speed: 0.10,
        })
      } catch (e) {
        console.warn('Vanta CLOUDS error:', e)
      }
    }
  }, [threeReady, fogReady, cloudsReady, isDark])

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
            src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.clouds.min.js"
            strategy="afterInteractive"
            onLoad={() => setCloudsReady(true)}
          />
        </>
      )}
      <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }} />
    </>
  )
}
