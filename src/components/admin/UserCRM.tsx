'use client'

import { useState } from 'react'
import { Table2, ChevronDown, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

interface Lead {
  id: string
  businessName: string | null
  clientName: string | null
  response: string | null
  shouldCall: boolean
  tag: string | null
  phone: string | null
  email: string | null
  callDateTime: string | null
  notes: string | null
  hasSeenDemo: boolean
  wantsCustomDemo: boolean
}

const tagStyles: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-400 border-red-500/30',
  WARM: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  COLD: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const tagLabels: Record<string, string> = { HOT: '🔴 Caliente', WARM: '🟡 Templado', COLD: '🔵 Frío' }

export default function UserCRM({ users }: { users: User[] }) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)

  async function loadLeads(userId: string) {
    if (!userId) { setLeads([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/leads?userId=${userId}`)
      if (!res.ok) throw new Error()
      setLeads(await res.json())
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(userId: string) {
    setSelectedUserId(userId)
    loadLeads(userId)
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Table2 size={16} className="text-purple-400" />
          CRM de Usuarios
        </h2>
        <div className="relative ml-auto">
          <select
            value={selectedUserId}
            onChange={(e) => handleSelect(e.target.value)}
            className="glass-input pl-3 pr-8 py-1.5 text-sm appearance-none cursor-pointer min-w-[200px]"
            style={{ backgroundColor: '#1a0a2e', color: '#f1f5f9' }}
          >
            <option value="" style={{ backgroundColor: '#1a0a2e', color: '#94a3b8' }}>Seleccionar usuario...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id} style={{ backgroundColor: '#1a0a2e', color: '#f1f5f9' }}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {!selectedUserId ? (
        <div className="py-12 text-center text-slate-600 text-sm">
          Selecciona un usuario para ver su CRM
        </div>
      ) : loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin text-purple-400" />
          Cargando...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="px-5 py-2 border-b border-white/[0.04]">
            <p className="text-xs text-slate-500">
              <span className="text-purple-300 font-medium">{selectedUser?.name}</span> — {leads.length} registro{leads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Etiqueta</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Negocio</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Respuesta</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Teléfono</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Fecha llamada</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-600">
                    Este usuario no tiene registros en su CRM
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2">
                      {lead.tag ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyles[lead.tag] ?? ''}`}>
                          {tagLabels[lead.tag] ?? lead.tag}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-300">{lead.businessName || '—'}</td>
                    <td className="px-4 py-2 text-slate-300">{lead.clientName || '—'}</td>
                    <td className="px-4 py-2 text-slate-400">{lead.response || '—'}</td>
                    <td className="px-4 py-2 text-slate-400">{lead.phone || '—'}</td>
                    <td className="px-4 py-2 text-slate-400">{lead.email || '—'}</td>
                    <td className="px-4 py-2 text-slate-400">
                      {lead.callDateTime ? new Date(lead.callDateTime).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-2 text-slate-500 max-w-[200px] truncate">{lead.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
