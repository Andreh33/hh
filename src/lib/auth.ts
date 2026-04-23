import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales requeridas')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta')
        }

        const ipAddress =
          (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] ||
          (req?.headers?.['x-real-ip'] as string) ||
          'unknown'

        const userAgent = (req?.headers?.['user-agent'] as string) || 'unknown'

        const session = await prisma.userSession.create({
          data: {
            userId: user.id,
            ipAddress: ipAddress.trim(),
            userAgent: userAgent.substring(0, 255),
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionDbId: session.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sessionDbId = user.sessionDbId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.sessionDbId = token.sessionDbId
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sessionDbId) {
        try {
          const loginSession = await prisma.userSession.findUnique({
            where: { id: token.sessionDbId },
          })
          if (loginSession && !loginSession.logoutAt) {
            const duration = Math.floor(
              (Date.now() - loginSession.loginAt.getTime()) / 1000
            )
            await prisma.userSession.update({
              where: { id: token.sessionDbId },
              data: {
                logoutAt: new Date(),
                duration,
              },
            })
          }
        } catch (error) {
          console.error('Error cerrando sesión:', error)
        }
      }
    },
  },
}
