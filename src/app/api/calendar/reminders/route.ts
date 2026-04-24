import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // YYYY-MM
    const upcoming = searchParams.get('upcoming') // check for upcoming reminders

    if (upcoming === 'true') {
      const now = new Date()
      const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000)
      const oneMinAgo = new Date(now.getTime() - 60 * 1000)

      const reminders = await prisma.reminder.findMany({
        where: {
          userId: session.user.id,
          notified: false,
          reminderAt: { gte: oneMinAgo, lte: fiveMinLater },
        },
      })
      return NextResponse.json(reminders)
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
        ...(month
          ? {
              reminderAt: {
                gte: new Date(`${month}-01T00:00:00`),
                lte: new Date(`${month}-31T23:59:59`),
              },
            }
          : {}),
      },
      orderBy: { reminderAt: 'asc' },
    })

    return NextResponse.json(reminders)
  } catch {
    return NextResponse.json({ error: 'Error al obtener recordatorios' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { title, reminderAt } = await req.json()
    if (!title || !reminderAt) {
      return NextResponse.json({ error: 'Título y fecha requeridos' }, { status: 400 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        reminderAt: new Date(reminderAt),
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear recordatorio' }, { status: 500 })
  }
}
