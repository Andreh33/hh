'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Table2, LogOut,
  Shield, ChevronRight, CalendarDays, PanelLeftClose, PanelLeftOpen, StickyNote,
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Props {
  collapsed: boolean
  onToggle: () => void
}

interface Notice {
  id: string
  content: string
}

const userLinks = [
  { href: '/crm', label: 'Mi CRM', icon: Table2 },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays },
]

const adminLinks2 = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm', label: 'CRM', icon: Table2 },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays },
]

const adminLinks = [
  { href: '/admin', label: 'Panel Admin', icon: Shield },
]

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    fetch('/api/notices')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setNotices(data))
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try { await fetch('/api/sessions/logout', { method: 'POST' }) } catch {}
    await signOut({ callbackUrl: '/login' })
    toast.success('Sesión cerrada correctamente')
  }

  const links = isAdmin ? adminLinks2 : userLinks

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} min-h-screen flex flex-col glass-card rounded-none rounded-r-2xl border-l-0 border-t-0 border-b-0 transition-all duration-300 flex-shrink-0`}
    >
      {/* Logo + toggle */}
      <div className={`p-4 border-b border-white/[0.06] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/logopequeno.webp" alt="LaTech" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-semibold text-white truncate">LaTech control de ventas</p>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl overflow-hidden">
            <Image src="/logopequeno.webp" alt="LaTech" width={32} height={32} className="w-full h-full object-cover" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`text-slate-600 hover:text-slate-300 transition-colors ${collapsed ? 'mt-2 ml-0' : ''}`}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-purple-300">
                {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{session?.user?.email}</p>
            </div>
            {isAdmin && (
              <span className="ml-auto flex-shrink-0 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                ADMIN
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
            Principal
          </p>
        )}
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link group ${pathname === href ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{label}</span>
                {pathname === href && <ChevronRight size={13} className="text-purple-400 opacity-60" />}
              </>
            )}
          </Link>
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mt-4 mb-2">
                Admin
              </p>
            )}
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sidebar-link group ${pathname.startsWith(href) ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {pathname.startsWith(href) && <ChevronRight size={13} className="text-purple-400 opacity-60" />}
                  </>
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Notices */}
      {!collapsed && notices.length > 0 && (
        <div className="px-3 pb-3 border-t border-white/[0.06] pt-3">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <StickyNote size={10} />
            Avisos
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {notices.map((n) => (
              <div key={n.id} className="px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/15">
                <p className="text-[11px] text-slate-300 leading-snug break-words">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Cerrar Sesión' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
