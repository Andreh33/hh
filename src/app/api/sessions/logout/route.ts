import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.sessionDbId) {
      return NextResponse.json({ success: true })
    }

    const loginSession = await prisma.userSession.findUnique({
      where: { id: session.user.sessionDbId },
    })

    if (loginSession && !loginSession.logoutAt) {
      const duration = Math.floor((Date.now() - loginSession.loginAt.getTime()) / 1000)
      await prisma.userSession.update({
        where: { id: session.user.sessionDbId },
        data: { logoutAt: new Date(), duration },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout session error:', error)
    return NextResponse.json({ success: true })
  }
}
