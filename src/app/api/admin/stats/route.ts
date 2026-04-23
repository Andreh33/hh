import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const today = new Date()
    const [totalUsers, totalLeads, sessionsToday, allSessions] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.userSession.count({
        where: {
          loginAt: { gte: startOfDay(today), lte: endOfDay(today) },
        },
      }),
      prisma.userSession.findMany({
        where: { duration: { not: null } },
        select: { duration: true },
      }),
    ])

    const totalSeconds = allSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)

    const recentSessions = await prisma.userSession.findMany({
      take: 50,
      orderBy: { loginAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({
      totalUsers,
      totalLeads,
      sessionsToday,
      totalSeconds,
      recentSessions,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
