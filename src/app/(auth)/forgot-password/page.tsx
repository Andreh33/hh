'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetToken, setResetToken] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al procesar la solicitud')
        return
      }

      setSent(true)
      if (data.resetToken) setResetToken(data.resetToken)
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card p-8 text-center">
            <CheckCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Solicitud enviada</h2>
            <p className="text-slate-400 text-sm mb-6">
              Si el email existe, recibirás un enlace para restablecer tu contraseña.
            </p>

            {resetToken && (
              <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-left">
                <p className="text-xs text-yellow-400 font-medium mb-1">Modo desarrollo:</p>
                <p className="text-xs text-slate-400 break-all">
                  Token: <span className="text-yellow-300">{resetToken}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  En producción, esto se envía por email.
                </p>
              </div>
            )}

            <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
              <ArrowLeft size={16} />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4">
            <Zap className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recuperar Contraseña</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa tu email y te enviaremos un enlace</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Mail size={16} />
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft size={14} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
