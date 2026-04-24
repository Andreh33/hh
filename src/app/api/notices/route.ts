import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(notices)
  } catch {
    return NextResponse.json({ error: 'Error al obtener avisos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: { content: content.trim() },
    })
    return NextResponse.json(notice, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear aviso' }, { status: 500 })
  }
}
