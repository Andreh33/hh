import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Users, Table2, Clock, Activity } from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import { formatDuration, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  const userId = session!.user.id
  const isAdmin = session!.user.role === 'ADMIN'

  const [totalLeads, userSessions, recentSessions] = await Promise.all([
    prisma.lead.count({ where: isAdmin ? {} : { userId } }),
    prisma.userSession.findMany({
      where: isAdmin ? {} : { userId },
      select: { duration: true, loginAt: true, logoutAt: true },
      orderBy: { loginAt: 'desc' },
      take: 5,
    }),
    prisma.userSession.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { loginAt: 'desc' },
      take: 8,
      include: isAdmin ? { user: { select: { name: true } } } : undefined,
    }),
  ])

  const totalSeconds = userSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)
  const totalUsers = isAdmin ? await prisma.user.count() : 1

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          subtitle={isAdmin ? 'Todos los usuarios' : 'En tu CRM'}
          icon={Table2}
          color="purple"
        />
        <StatsCard
          title="Horas Totales"
          value={formatDuration(totalSeconds)}
          subtitle="Tiempo acumulado"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Sesiones"
          value={userSessions.length}
          subtitle="Historial completo"
          icon={Activity}
          color="green"
        />
        {isAdmin && (
          <StatsCard
            title="Usuarios"
            value={totalUsers}
            subtitle="Registrados"
            icon={Users}
            color="orange"
          />
        )}
      </div>

      {/* Recent Sessions */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          Sesiones Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {isAdmin && <th className="text-left py-2 px-3 text-slate-500 font-medium">Usuario</th>}
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Inicio</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Fin</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Duración</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-600">
                    Sin sesiones registradas
                  </td>
                </tr>
              ) : (
                recentSessions.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    {isAdmin && (
                      <td className="py-2 px-3 text-slate-300">
                        {(s as any).user?.name ?? '—'}
                      </td>
                    )}
                    <td className="py-2 px-3 text-slate-400">{formatDate(s.loginAt)}</td>
                    <td className="py-2 px-3 text-slate-400">{s.logoutAt ? formatDate(s.logoutAt) : '—'}</td>
                    <td className="py-2 px-3 text-slate-300">{formatDuration(s.duration)}</td>
                    <td className="py-2 px-3">
                      {s.logoutAt ? (
                        <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/20 px-1.5 py-0.5 rounded-full">
                          Cerrada
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
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
    </div>
  )
}
