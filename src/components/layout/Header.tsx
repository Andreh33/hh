'use client'

import { usePathname } from 'next/navigation'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Resumen de tu actividad' },
  '/crm': { title: 'Mi CRM', description: 'Gestiona tus clientes y leads' },
  '/admin': { title: 'Panel de Administración', description: 'Gestión de usuarios y sesiones' },
  '/calendar': { title: 'Calendario', description: 'Notas y recordatorios por día' },
  '/avisos': { title: 'Avisos', description: 'Comunicados del equipo' },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] ?? { title: 'CRM Pro', description: '' }
  const now = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white">{page.title}</h1>
        {page.description && (
          <p className="text-xs text-slate-500 mt-0.5">{page.description}</p>
        )}
      </div>
      <div className="text-right pr-24">
        <p className="text-xs text-slate-500 capitalize">{now}</p>
      </div>
    </header>
  )
}
