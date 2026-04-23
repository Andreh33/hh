import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'purple' | 'blue' | 'green' | 'orange'
}

const colorMap = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    value: 'text-purple-300',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    value: 'text-blue-300',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    value: 'text-emerald-300',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: 'text-orange-400',
    value: 'text-orange-300',
  },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'purple' }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium truncate">{title}</p>
        <p className={`text-2xl font-bold ${c.value} mt-0.5`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}
