import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { StickyNote } from 'lucide-react'
import CRMTable from '@/components/crm/CRMTable'

export default async function CRMPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  const notices = isAdmin ? [] : await prisma.notice.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {notices.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="text-xs font-semibold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <StickyNote size={13} />
            Avisos
          </h2>
          <div className="space-y-2">
            {notices.map((n) => (
              <div key={n.id} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <CRMTable />
    </div>
  )
}
