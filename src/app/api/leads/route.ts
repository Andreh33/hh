import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const search = searchParams.get('search') || ''

    const targetUserId =
      session.user.role === 'ADMIN' && userId ? userId : session.user.id

    const leads = await prisma.lead.findMany({
      where: {
        userId: targetUserId,
        ...(search
          ? {
              OR: [
                { businessName: { contains: search, mode: 'insensitive' } },
                { clientName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { commercialName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json({ error: 'Error al obtener leads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const userId = session.user.role === 'ADMIN' && body.userId ? body.userId : session.user.id

    const maxOrder = await prisma.lead.aggregate({
      where: { userId },
      _max: { order: true },
    })

    const lead = await prisma.lead.create({
      data: {
        userId,
        businessName: body.businessName || '',
        clientName: body.clientName || '',
        response: body.response || '',
        shouldCall: body.shouldCall ?? false,
        callDateTime: body.callDateTime ? new Date(body.callDateTime) : null,
        hasSeenDemo: body.hasSeenDemo ?? false,
        wantsCustomDemo: body.wantsCustomDemo ?? false,
        notes: body.notes || '',
        issues: body.issues || '',
        phone: body.phone || '',
        email: body.email || '',
        commercialName: body.commercialName || '',
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ error: 'Error al crear lead' }, { status: 500 })
  }
}
