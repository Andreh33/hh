'use client'

import { Activity } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

interface Session {
  id: string
  loginAt: string
  logoutAt: string | null
  duration: number | null
  ipAddress: string | null
  user: { name: string; email: string }
}

export default function SessionsLog({ sessions }: { sessions: Session[] }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          Log de Sesiones Recientes ({sessions.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Usuario</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Inicio sesión</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Cierre</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Duración</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">IP</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-600">Sin sesiones</td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-2.5">
                    <div>
                      <p className="text-slate-200 font-medium">{s.user.name}</p>
                      <p className="text-slate-600 text-[10px]">{s.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{formatDate(s.loginAt)}</td>
                  <td className="px-4 py-2.5 text-slate-400">{s.logoutAt ? formatDate(s.logoutAt) : '—'}</td>
                  <td className="px-4 py-2.5 text-purple-300 font-medium">{formatDuration(s.duration)}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">{s.ipAddress ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {s.logoutAt ? (
                      <span className="text-[10px] bg-slate-500/15 text-slate-500 border border-slate-500/15 px-1.5 py-0.5 rounded-full">
                        Cerrada
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                        Activa
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
