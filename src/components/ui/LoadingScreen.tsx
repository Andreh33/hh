'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setVisible(false), 300)
          return 100
        }
        return p + Math.random() * 18 + 8
      })
    }, 120)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d0d1a 100%)',
        opacity: progress >= 100 ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center animate-pulse-slow">
          <Zap className="w-8 h-8 text-purple-400" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">LaTech control de ventas</h1>
          <p className="text-xs text-slate-500 mt-1">Cargando...</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-white/5 rounded-full mt-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-all duration-150"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
