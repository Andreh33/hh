'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Bell, Save, Loader2, X, Phone, ChevronDown } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface CalendarNote { id: string; date: string; content: string }
interface Reminder { id: string; title: string; reminderAt: string; notified: boolean }
interface Call {
  id: string
  clientName: string | null
  businessName: string | null
  phone: string | null
  callDateTime: string
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  const t = useRef<NodeJS.Timeout | null>(null)
  return useCallback((...args: Parameters<T>) => {
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => fn(...args), ms)
  }, [fn, ms]) as T
}

export default function CalendarView() {
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState<Record<string, CalendarNote>>({})
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [calls, setCalls] = useState<Record<string, Call[]>>({})
  const [callsOpen, setCallsOpen] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [addingReminder, setAddingReminder] = useState(false)
  const [loading, setLoading] = useState(true)

  const monthKey = format(month, 'yyyy-MM')

  async function loadData(m: Date) {
    setLoading(true)
    const key = format(m, 'yyyy-MM')
    try {
      const [notesRes, remRes, callsRes] = await Promise.all([
        fetch(`/api/calendar/notes?month=${key}`),
        fetch(`/api/calendar/reminders?month=${key}`),
        fetch(`/api/leads/calls?month=${key}`),
      ])
      const notesData: CalendarNote[] = await notesRes.json()
      const remData: Reminder[] = await remRes.json()
      const callsRaw = await callsRes.json()
      const callsData: Call[] = Array.isArray(callsRaw) ? callsRaw : []

      const notesMap: Record<string, CalendarNote> = {}
      notesData.forEach((n) => { notesMap[n.date] = n })
      setNotes(notesMap)
      setReminders(remData)

      // Group calls by local date (YYYY-MM-DD)
      const callsMap: Record<string, Call[]> = {}
      callsData.forEach((c) => {
        const dateKey = new Date(c.callDateTime).toLocaleDateString('sv-SE') // sv-SE gives YYYY-MM-DD
        if (!callsMap[dateKey]) callsMap[dateKey] = []
        callsMap[dateKey].push(c)
      })
      setCalls(callsMap)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData(month) }, [monthKey])

  useEffect(() => {
    setNoteText(notes[selected]?.content ?? '')
  }, [selected, notes])

  const saveNote = useCallback(async (date: string, content: string) => {
    setSavingNote(true)
    try {
      const res = await fetch('/api/calendar/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, content }),
      })
      const note = await res.json()
      setNotes((prev) => ({ ...prev, [date]: note }))
    } catch {
      toast.error('Error al guardar nota')
    } finally {
      setSavingNote(false)
    }
  }, [])

  const debouncedSave = useDebounce(saveNote, 800)

  function handleNoteChange(val: string) {
    setNoteText(val)
    debouncedSave(selected, val)
  }

  async function deleteNote(date: string) {
    const note = notes[date]
    if (!note) return
    try {
      await fetch(`/api/calendar/notes/${note.id}`, { method: 'DELETE' })
      setNotes((prev) => { const n = { ...prev }; delete n[date]; return n })
      setNoteText('')
      toast.success('Nota eliminada')
    } catch {
      toast.error('Error al eliminar nota')
    }
  }

  async function addReminder() {
    if (!newTitle.trim() || !newTime) {
      toast.error('Introduce título y hora')
      return
    }
    setAddingReminder(true)
    try {
      const dt = new Date(`${selected}T${newTime}:00`).toISOString()
      const res = await fetch('/api/calendar/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, reminderAt: dt }),
      })
      if (!res.ok) throw new Error()
      const reminder = await res.json()
      setReminders((prev) => [...prev, reminder])
      setNewTitle('')
      setNewTime('')
      toast.success('Recordatorio programado')
    } catch {
      toast.error('Error al añadir recordatorio')
    } finally {
      setAddingReminder(false)
    }
  }

  async function deleteReminder(id: string) {
    try {
      await fetch(`/api/calendar/reminders/${id}`, { method: 'DELETE' })
      setReminders((prev) => prev.filter((r) => r.id !== id))
      toast.success('Recordatorio eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const firstDay = startOfMonth(month)
  const lastDay = endOfMonth(month)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startPad = (getDay(firstDay) + 6) % 7

  const selectedReminders = reminders.filter((r) => r.reminderAt.startsWith(selected))
  const selectedCalls = calls[selected] ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
      {/* Calendar grid */}
      <div className="lg:col-span-2 glass-card p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-semibold text-white capitalize">
            {format(month, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-slate-600 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={20} className="animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const hasNote = !!notes[key]?.content
              const hasReminder = reminders.some((r) => r.reminderAt.startsWith(key))
              const hasCalls = !!(calls[key]?.length)
              const isSelected = key === selected
              const todayDay = isToday(day)

              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-150
                    ${isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : todayDay
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                >
                  {format(day, 'd')}
                  <div className="flex gap-0.5 mt-0.5">
                    {hasNote && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                    )}
                    {hasReminder && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400'}`} />
                    )}
                    {hasCalls && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-400'}`} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05] flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Nota
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-orange-400" /> Recordatorio
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Llamada
          </div>
        </div>
      </div>

      {/* Day panel */}
      <div className="space-y-4">
        {/* Selected day header */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white capitalize mb-1">
            {format(parseISO(selected), "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          <p className="text-xs text-slate-500">
            {selectedReminders.length} recordatorio{selectedReminders.length !== 1 ? 's' : ''}
            {selectedCalls.length > 0 && (
              <> · <span className="text-sky-400">{selectedCalls.length} llamada{selectedCalls.length !== 1 ? 's' : ''}</span></>
            )}
          </p>
        </div>

        {/* Scheduled calls */}
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setCallsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Phone size={12} />
              Llamadas del día
              {selectedCalls.length > 0 && (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedCalls.length}
                </span>
              )}
            </h4>
            <ChevronDown
              size={13}
              className={`text-slate-500 transition-transform duration-200 ${callsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {callsOpen && (
            <div className="px-4 pb-4">
              {selectedCalls.length === 0 ? (
                <p className="text-xs text-slate-700 text-center py-3">Sin llamadas programadas</p>
              ) : (
                <div className="space-y-2">
                  {selectedCalls.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/15">
                      <div className="flex items-start gap-2">
                        <Phone size={12} className="text-sky-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {c.clientName || c.businessName || 'Sin nombre'}
                          </p>
                          {c.businessName && c.clientName && (
                            <p className="text-[10px] text-slate-500 truncate">{c.businessName}</p>
                          )}
                          {c.phone && (
                            <p className="text-[11px] text-sky-400 font-medium mt-0.5">{c.phone}</p>
                          )}
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {format(new Date(c.callDateTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nota del día</h4>
            <div className="flex items-center gap-2">
              {savingNote && <Loader2 size={12} className="animate-spin text-purple-400" />}
              {notes[selected] && (
                <button onClick={() => deleteNote(selected)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Escribe una nota para este día..."
            rows={5}
            className="glass-input w-full px-3 py-2 text-sm resize-none"
          />
          {savingNote && (
            <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
              <Save size={9} /> Guardando...
            </p>
          )}
        </div>

        {/* Reminders */}
        <div className="glass-card p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell size={12} className="text-orange-400" />
            Recordatorios
          </h4>

          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: Llamar a Carlos Martinez"
              className="glass-input w-full px-3 py-2 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && addReminder()}
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="glass-input flex-1 px-3 py-2 text-xs"
              />
              <button
                onClick={addReminder}
                disabled={addingReminder}
                className="btn-primary px-3 py-2 flex items-center gap-1 text-xs"
              >
                {addingReminder ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Añadir
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 mb-3 flex items-center gap-1">
            <Bell size={9} className="text-orange-400" />
            Sonará 5 minutos antes automáticamente
          </p>

          <div className="space-y-1.5">
            {selectedReminders.length === 0 ? (
              <p className="text-xs text-slate-700 text-center py-2">Sin recordatorios</p>
            ) : (
              selectedReminders.map((r) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/15 group">
                  <Bell size={11} className="text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {format(parseISO(r.reminderAt), 'HH:mm')}
                      {r.notified && <span className="ml-1 text-emerald-500">✓ Notificado</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
