'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    function animate() {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px)`
      }
      raf.current = requestAnimationFrame(animate)
    }

    const onEnter = () => {
      if (ring.current) ring.current.style.transform += ' scale(1.5)'
    }

    window.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(animate)

    // Hide default cursor
    document.body.style.cursor = 'none'

    const links = document.querySelectorAll('a, button, input, textarea, select')
    links.forEach((el) => {
      (el as HTMLElement).style.cursor = 'none'
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dot}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-purple-400 pointer-events-none z-[9999] mix-blend-screen"
        style={{ willChange: 'transform' }}
      />
      {/* Ring */}
      <div
        ref={ring}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-purple-500/60 pointer-events-none z-[9998]"
        style={{ willChange: 'transform', transition: 'width 0.2s, height 0.2s' }}
      />
    </>
  )
}
