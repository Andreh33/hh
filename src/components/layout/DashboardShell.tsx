'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from './Sidebar'
import Header from './Header'
import ReminderChecker from '@/components/ui/ReminderChecker'

const CustomCursor = dynamic(() => import('@/components/ui/CustomCursor'), { ssr: false })

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <CustomCursor />
      <ReminderChecker />
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  )
}
