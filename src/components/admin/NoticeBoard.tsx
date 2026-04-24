'use client'

import { useState } from 'react'
import { Send, Trash2, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Notice {
  id: string
  content: string
  createdAt: string
}

export default function NoticeBoard({ initial }: { initial: Notice[] }) {
  const [notices, setNotices] = useState(initial)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function handlePost() {
    if (!text.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      })
      if (!res.ok) throw new Error()
      const notice = await res.json()
      setNotices((prev) => [notice, ...prev])
      setText('')
      toast.success('Aviso publicado')
    } catch {
      toast.error('Error al publicar')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setNotices((prev) => prev.filter((n) => n.id !== id))
      toast.success('Aviso eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="glass-card p-5">
      <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <StickyNote size={16} className="text-purple-400" />
        Tablón de Avisos
      </h2>

      {/* Editor */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un aviso para todos los usuarios..."
          rows={2}
          className="glass-input flex-1 px-3 py-2 text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handlePost()
          }}
        />
        <button
          onClick={handlePost}
          disabled={sending || !text.trim()}
          className="btn-primary px-4 flex items-center gap-2 text-sm self-start py-2"
        >
          <Send size={14} />
          Publicar
        </button>
      </div>

      {/* Notices list */}
      <div className="space-y-2">
        {notices.length === 0 ? (
          <p className="text-slate-600 text-xs text-center py-4">Sin avisos publicados</p>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{n.content}</p>
                <p className="text-[10px] text-slate-600 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
