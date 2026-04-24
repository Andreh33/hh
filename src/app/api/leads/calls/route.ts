import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // 'YYYY-MM'
    if (!month) return NextResponse.json({ error: 'month requerido' }, { status: 400 })

    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1)
    const end = new Date(year, mon, 1)

    const leads = await prisma.lead.findMany({
      where: {
        userId: session.user.id,
        callDateTime: { gte: start, lt: end },
      },
      select: {
        id: true,
        clientName: true,
        businessName: true,
        phone: true,
        callDateTime: true,
      },
      orderBy: { callDateTime: 'asc' },
    })

    return NextResponse.json(leads)
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
