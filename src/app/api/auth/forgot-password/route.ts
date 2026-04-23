import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addHours } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        expiresAt: addHours(new Date(), 2),
      },
    })

    // In production: send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken.token}`
    // await sendResetEmail(user.email, resetUrl)

    return NextResponse.json({
      success: true,
      // Only exposed in development for demo purposes
      ...(process.env.NODE_ENV !== 'production' && { resetToken: resetToken.token }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
