import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'CRM by andreh',
  description: 'Sistema CRM profesional para gestión de clientes y seguimiento comercial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(17, 10, 40, 0.95)',
                color: '#f1f5f9',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: { primary: '#a78bfa', secondary: '#0d0d1a' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#0d0d1a' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
