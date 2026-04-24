'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Table2,
  Users,
  LogOut,
  Zap,
  Shield,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const userLinks = [
  { href: '/crm', label: 'Mi CRM', icon: Table2 },
]

const adminLinks2 = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm', label: 'CRM', icon: Table2 },
]

const adminLinks = [
  { href: '/admin', label: 'Panel Admin', icon: Shield },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'ADMIN'

  async function handleLogout() {
    try {
      await fetch('/api/sessions/logout', { method: 'POST' })
    } catch {}
    await signOut({ callbackUrl: '/login' })
    toast.success('Sesión cerrada correctamente')
  }

  return (
    <aside className="w-60 min-h-screen flex flex-col glass-card rounded-none rounded-r-2xl border-l-0 border-t-0 border-b-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">CRM by Andreh</p>
            <p className="text-xs text-slate-500">v1.0</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-purple-300">
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
          {isAdmin && (
            <span className="ml-auto flex-shrink-0 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
          Principal
        </p>
        {(isAdmin ? adminLinks2 : userLinks).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link group ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {pathname === href && (
              <ChevronRight size={14} className="text-purple-400 opacity-60" />
            )}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mt-4 mb-2">
              Administración
            </p>
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sidebar-link group ${pathname.startsWith(href) ? 'active' : ''}`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {pathname.startsWith(href) && (
                  <ChevronRight size={14} className="text-purple-400 opacity-60" />
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
