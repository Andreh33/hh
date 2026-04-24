'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Plus, Trash2, Search, ChevronUp, ChevronDown, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  businessName: string | null
  clientName: string | null
  response: string | null
  shouldCall: boolean
  callDateTime: string | null
  hasSeenDemo: boolean
  wantsCustomDemo: boolean
  notes: string | null
  issues: string | null
  phone: string | null
  email: string | null
  commercialName: string | null
  tag: string | null
  order: number
  createdAt: string
}

type SortKey = keyof Lead
type SortDir = 'asc' | 'desc'

const tagOptions = [
  { value: '', label: '— Sin etiqueta' },
  { value: 'HOT', label: '🔴 Caliente' },
  { value: 'WARM', label: '🟡 Templado' },
  { value: 'COLD', label: '🔵 Frío' },
]

const productOptions = [
  { value: '', label: '—' },
  { value: 'IA', label: '🤖 IA' },
  { value: 'Web', label: '🌐 Web' },
  { value: 'Ambas', label: '✨ Ambas' },
]
const tagStyles: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-400 border-red-500/30',
  WARM: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  COLD: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const columns: { key: keyof Lead; label: string; width: string; type: 'text' | 'bool' | 'datetime' | 'textarea' | 'tag' | 'product' }[] = [
  { key: 'tag', label: 'Etiqueta', width: 'min-w-[120px]', type: 'tag' },
  { key: 'businessName', label: 'Negocio', width: 'min-w-[130px]', type: 'text' },
  { key: 'clientName', label: 'Cliente', width: 'min-w-[130px]', type: 'text' },
  { key: 'response', label: 'Respuesta', width: 'min-w-[120px]', type: 'text' },
  { key: 'shouldCall', label: '¿Llamar?', width: 'min-w-[80px]', type: 'bool' },
  { key: 'callDateTime', label: 'Fecha llamada', width: 'min-w-[160px]', type: 'datetime' },
  { key: 'hasSeenDemo', label: '¿Vio demo?', width: 'min-w-[90px]', type: 'bool' },
  { key: 'wantsCustomDemo', label: 'Demo person.', width: 'min-w-[100px]', type: 'bool' },
  { key: 'notes', label: 'Notas', width: 'min-w-[160px]', type: 'textarea' },
  { key: 'issues', label: 'Inconvenientes', width: 'min-w-[150px]', type: 'textarea' },
  { key: 'phone', label: 'Teléfono', width: 'min-w-[120px]', type: 'text' },
  { key: 'email', label: 'Email', width: 'min-w-[160px]', type: 'text' },
  { key: 'commercialName', label: 'IA / Web / Ambas', width: 'min-w-[130px]', type: 'product' },
]

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  const timer = useRef<NodeJS.Timeout | null>(null)
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => fn(...args), delay)
    }) as T,
    [fn, delay]
  )
}

interface CellProps {
  value: string | boolean | null
  type: 'text' | 'bool' | 'datetime' | 'textarea' | 'tag' | 'product'
  onChange: (val: string | boolean) => void
  saving: boolean
}

function Cell({ value, type, onChange, saving }: CellProps) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(String(value ?? ''))
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setLocal(String(value ?? ''))
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  if (type === 'product') {
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] font-medium px-2 py-0.5 rounded-full border cursor-pointer bg-transparent outline-none w-full text-slate-300 border-white/10"
        style={{ backgroundColor: 'transparent' }}
      >
        {productOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d0d1a] text-slate-200">
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'tag') {
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => {
          if (e.target.value === 'HOT') {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#7c3aed', '#a78bfa', '#f59e0b', '#ef4444'] })
          }
          onChange(e.target.value)
        }}
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer bg-transparent outline-none w-full ${
          value ? tagStyles[String(value)] : 'text-slate-600 border-white/10'
        }`}
      >
        {tagOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d0d1a] text-slate-200">
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'bool') {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={() => onChange(!value)}
          className={`w-8 h-4 rounded-full transition-all duration-200 relative flex-shrink-0 ${
            value ? 'bg-purple-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${
              value ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    )
  }

  if (type === 'datetime') {
    return (
      <input
        type="datetime-local"
        value={local ? local.slice(0, 16) : ''}
        onChange={(e) => {
          setLocal(e.target.value)
          onChange(e.target.value || '')
        }}
        className="table-cell-input text-[11px] w-full"
      />
    )
  }

  if (type === 'textarea') {
    return editing ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          setEditing(false)
          onChange(local)
        }}
        rows={3}
        className="table-cell-input resize-none text-[11px] w-full"
      />
    ) : (
      <div
        onClick={() => setEditing(true)}
        className="w-full min-h-[24px] text-[11px] text-slate-300 cursor-text px-1 py-0.5 hover:bg-purple-500/10 rounded whitespace-pre-wrap break-words"
      >
        {local || <span className="text-slate-600 italic">—</span>}
        {saving && <Loader2 size={10} className="inline ml-1 animate-spin text-purple-400" />}
      </div>
    )
  }

  return editing ? (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        setEditing(false)
        onChange(local)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setEditing(false)
          onChange(local)
        }
        if (e.key === 'Escape') {
          setEditing(false)
          setLocal(String(value ?? ''))
        }
      }}
      className="table-cell-input text-[11px] w-full"
    />
  ) : (
    <div
      onClick={() => setEditing(true)}
      className="w-full min-h-[24px] text-[11px] text-slate-300 cursor-text px-1 py-0.5 hover:bg-purple-500/10 rounded truncate"
    >
      {local || <span className="text-slate-600 italic">—</span>}
      {saving && <Loader2 size={10} className="inline ml-1 animate-spin text-purple-400" />}
    </div>
  )
}

export default function CRMTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('order')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [addingRow, setAddingRow] = useState(false)

  async function fetchLeads(q = '') {
    try {
      const res = await fetch(`/api/leads?search=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLeads(data)
    } catch {
      toast.error('Error al cargar los leads')
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce((q: string) => fetchLeads(q), 350)

  useEffect(() => {
    fetchLeads()
  }, [])

  function handleSearch(q: string) {
    setSearch(q)
    debouncedSearch(q)
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const updateLead = useCallback(
    async (id: string, field: string, value: string | boolean) => {
      setSavingIds((prev) => new Set(prev).add(id))
      try {
        const res = await fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)))
      } catch {
        toast.error('Error al guardar')
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    []
  )

  const debouncedUpdate = useDebounce(updateLead, 600)

  async function addRow() {
    setAddingRow(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error()
      const lead = await res.json()
      setLeads((prev) => [...prev, lead])
      toast.success('Fila añadida')
    } catch {
      toast.error('Error al añadir fila')
    } finally {
      setAddingRow(false)
    }
  }

  async function deleteRow(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setLeads((prev) => prev.filter((l) => l.id !== id))
      toast.success('Registro eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-sm">Cargando datos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar en CRM..."
            className="glass-input w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>

        <button
          onClick={addRow}
          disabled={addingRow}
          className="btn-primary px-4 py-2 flex items-center gap-2 text-sm ml-auto"
        >
          {addingRow ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Añadir fila
        </button>
      </div>

      {/* Table count */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{sortedLeads.length} registro{sortedLeads.length !== 1 ? 's' : ''}</span>
        {savingIds.size > 0 && (
          <span className="flex items-center gap-1 text-purple-400">
            <Save size={11} className="animate-pulse" />
            Guardando...
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="w-8 px-2 py-3 text-left text-slate-600 font-medium">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.width} px-2 py-3 text-left text-slate-400 font-medium cursor-pointer select-none hover:text-slate-200 transition-colors`}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp size={11} className="text-purple-400" />
                        ) : (
                          <ChevronDown size={11} className="text-purple-400" />
                        )
                      ) : (
                        <ChevronUp size={11} className="text-slate-700" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-2 py-3 text-slate-600 font-medium">Del</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="text-center py-16 text-slate-600"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p>Sin registros</p>
                      <button
                        onClick={addRow}
                        className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} />
                        Añadir primer registro
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-2 py-2 text-slate-600 text-[10px]">{idx + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-2 py-1 align-middle">
                        <Cell
                          value={lead[col.key] as string | boolean | null}
                          type={col.type}
                          saving={savingIds.has(lead.id)}
                          onChange={(val) => {
                            // Optimistic update
                            setLeads((prev) =>
                              prev.map((l) =>
                                l.id === lead.id ? { ...l, [col.key]: val } : l
                              )
                            )
                            if (col.type === 'bool' || col.type === 'tag' || col.type === 'product') {
                              updateLead(lead.id, col.key, val)
                            } else {
                              debouncedUpdate(lead.id, col.key, val)
                            }
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteRow(lead.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
