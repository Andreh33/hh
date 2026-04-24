'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  suffix?: string
}

export default function AnimatedCounter({ value, duration = 1200, suffix = '' }: Props) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    const start = 0
    const end = value

    function step(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(start + (end - start) * ease))
      if (progress < 1) {
        raf.current = requestAnimationFrame(step)
      } else {
        setDisplay(end)
      }
    }

    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value, duration])

  return <>{display}{suffix}</>
}
