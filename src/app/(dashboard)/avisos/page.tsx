import { prisma } from '@/lib/db'
import { StickyNote } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AvisosPage() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <StickyNote size={18} className="text-purple-400" />
        <h1 className="text-lg font-semibold text-white">Avisos</h1>
        {notices.length > 0 && (
          <span className="text-xs text-slate-500 ml-1">{notices.length} publicado{notices.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {notices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <StickyNote size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600 text-sm">No hay avisos publicados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="glass-card p-5">
              <p className="text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                {n.content}
              </p>
              <p className="text-[11px] text-slate-600 mt-3 pt-3 border-t border-white/[0.05]">
                {formatDate(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
