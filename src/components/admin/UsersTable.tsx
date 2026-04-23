'use client'

import { useState } from 'react'
import { Trash2, Edit2, Shield, User, Check, X } from 'lucide-react'
import { formatDuration, formatDateShort, totalHours } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  totalSessions: number
  totalLeads: number
  totalSeconds: number
}

export default function UsersTable({ users: initial }: { users: UserData[] }) {
  const [users, setUsers] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuario eliminado')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  async function handleSaveName(id: string) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, name: updated.name } : u)))
      setEditingId(null)
      toast.success('Nombre actualizado')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  async function handleToggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
      toast.success('Rol actualizado')
    } catch {
      toast.error('Error al cambiar rol')
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User size={16} className="text-purple-400" />
          Usuarios ({users.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Rol</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Registro</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Sesiones</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Leads</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Tiempo total</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] group transition-colors">
                <td className="px-5 py-3">
                  {editingId === user.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(user.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                        className="glass-input px-2 py-1 text-xs w-28"
                      />
                      <button onClick={() => handleSaveName(user.id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-purple-300">{user.name[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-slate-200 font-medium">{user.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleRole(user.id, user.role)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/20 hover:bg-slate-500/30'
                    }`}
                  >
                    {user.role === 'ADMIN' ? <Shield size={9} /> : <User size={9} />}
                    {user.role}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDateShort(user.createdAt)}</td>
                <td className="px-4 py-3 text-slate-300">{user.totalSessions}</td>
                <td className="px-4 py-3 text-slate-300">{user.totalLeads}</td>
                <td className="px-4 py-3 text-purple-300 font-medium">{totalHours(user.totalSeconds)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(user.id)
                        setEditName(user.name)
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
