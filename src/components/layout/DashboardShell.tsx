'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ReminderChecker from '@/components/ui/ReminderChecker'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <ReminderChecker />
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    </>
  )
}
