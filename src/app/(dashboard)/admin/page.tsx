import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Users, Clock, Table2, Activity } from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import UsersTable from '@/components/admin/UsersTable'
import SessionsLog from '@/components/admin/SessionsLog'
import NoticeBoard from '@/components/admin/NoticeBoard'
import UserCRM from '@/components/admin/UserCRM'
import { totalHours } from '@/lib/utils'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  const [usersRaw, totalLeads, sessionsToday, allSessions, recentSessions, notices] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { sessions: true, leads: true } },
        sessions: {
          where: { logoutAt: { not: null } },
          select: { duration: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.count(),
    prisma.userSession.count({
      where: {
        loginAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.userSession.findMany({
      where: { duration: { not: null } },
      select: { duration: true },
    }),
    prisma.userSession.findMany({
      take: 50,
      orderBy: { loginAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.notice.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const totalSeconds = allSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)

  const users = usersRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    totalSessions: u._count.sessions,
    totalLeads: u._count.leads,
    totalSeconds: u.sessions.reduce((acc, s) => acc + (s.duration ?? 0), 0),
  }))

  const sessions = recentSessions.map((s) => ({
    id: s.id,
    loginAt: s.loginAt.toISOString(),
    logoutAt: s.logoutAt?.toISOString() ?? null,
    duration: s.duration,
    ipAddress: s.ipAddress,
    user: s.user,
  }))

  const noticesSerialized = notices.map((n) => ({
    id: n.id,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
  }))

  const usersForCRM = usersRaw.map((u) => ({ id: u.id, name: u.name, email: u.email }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Usuarios" value={users.length} subtitle="Registrados" icon={Users} color="purple" />
        <StatsCard title="Total Leads" value={totalLeads} subtitle="Todos los usuarios" icon={Table2} color="blue" />
        <StatsCard title="Sesiones Hoy" value={sessionsToday} subtitle="Inicios de sesión" icon={Activity} color="green" />
        <StatsCard title="Horas Totales" value={totalHours(totalSeconds)} subtitle="Tiempo acumulado" icon={Clock} color="orange" />
      </div>

      {/* Notice board */}
      <NoticeBoard initial={noticesSerialized} />

      {/* Users table */}
      <UsersTable users={users} />

      {/* CRM de usuarios */}
      <UserCRM users={usersForCRM} />

      {/* Sessions log */}
      <SessionsLog sessions={sessions} />
    </div>
  )
}
