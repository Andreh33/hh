'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { playReminderSound } from '@/lib/sound'
import { Bell } from 'lucide-react'

export default function ReminderChecker() {
  const { data: session } = useSession()
  const notifiedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!session) return

    async function checkReminders() {
      try {
        const res = await fetch('/api/calendar/reminders?upcoming=true')
        if (!res.ok) return
        const reminders: { id: string; title: string; reminderAt: string }[] = await res.json()

        for (const r of reminders) {
          if (notifiedIds.current.has(r.id)) continue
          notifiedIds.current.add(r.id)

          // Mark as notified in DB
          fetch(`/api/calendar/reminders/${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notified: true }),
          })

          // Play sound
          playReminderSound()

          // Show toast
          const time = new Date(r.reminderAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })

          toast.custom(
            (t) => (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border border-orange-500/30 bg-[rgba(17,10,40,0.95)] backdrop-blur-xl shadow-xl max-w-sm transition-all ${
                  t.visible ? 'animate-slide-up' : 'opacity-0'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-orange-300 mb-0.5">¡Recordatorio!</p>
                  <p className="text-sm text-white font-medium">{r.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Programado para las {time}</p>
                </div>
              </div>
            ),
            { duration: 10000 }
          )
        }
      } catch {
        // Silent fail
      }
    }

    checkReminders()
    const interval = setInterval(checkReminders, 30_000)
    return () => clearInterval(interval)
  }, [session])

  return null
}
