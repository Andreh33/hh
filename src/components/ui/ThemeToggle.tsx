'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-[200] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 active:scale-95"
      style={isDark ? {
        background: 'rgba(17, 10, 40, 0.88)',
        border: '1px solid rgba(139, 92, 246, 0.45)',
        color: '#c4b5fd',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      } : {
        background: 'rgba(255, 255, 255, 0.94)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        color: '#2563eb',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 16px rgba(59, 130, 246, 0.2)',
      }}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <>
          <Sun size={13} />
          <span>Claro</span>
        </>
      ) : (
        <>
          <Moon size={13} />
          <span>Oscuro</span>
        </>
      )}
    </button>
  )
}
