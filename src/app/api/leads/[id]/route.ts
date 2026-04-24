import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const lead = await prisma.lead.findUnique({ where: { id: params.id } })
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    if (session.user.role !== 'ADMIN' && lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    const stringFields = ['businessName', 'clientName', 'response', 'notes', 'issues', 'phone', 'email', 'commercialName', 'tag']
    const boolFields = ['shouldCall', 'hasSeenDemo', 'wantsCustomDemo']

    for (const field of stringFields) {
      if (field in body) updateData[field] = body[field] ?? ''
    }
    for (const field of boolFields) {
      if (field in body) updateData[field] = Boolean(body[field])
    }
    if ('callDateTime' in body) {
      updateData.callDateTime = body.callDateTime ? new Date(body.callDateTime) : null
    }
    if ('order' in body) updateData.order = Number(body.order)

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json({ error: 'Error al actualizar lead' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const lead = await prisma.lead.findUnique({ where: { id: params.id } })
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    if (session.user.role !== 'ADMIN' && lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json({ error: 'Error al eliminar lead' }, { status: 500 })
  }
}
