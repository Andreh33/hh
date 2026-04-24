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

    const notes = await prisma.calendarNote.findMany({
      where: {
        userId: session.user.id,
        ...(month ? { date: { startsWith: month } } : {}),
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { date, content } = await req.json()
    if (!date) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

    const note = await prisma.calendarNote.upsert({
      where: { userId_date: { userId: session.user.id, date } },
      update: { content: content ?? '' },
      create: { userId: session.user.id, date, content: content ?? '' },
    })

    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Error al guardar nota' }, { status: 500 })
  }
}
