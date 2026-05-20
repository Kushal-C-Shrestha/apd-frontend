import { useEffect, useState } from 'react'
import { Loader2, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api'

const TABS = ['All', 'Pending', 'Completed', 'Cancelled']

const STATUS = {
    Pending:   'bg-amber-50 text-amber-700',
    Confirmed: 'bg-blue-50 text-blue-700',
    Completed: 'bg-emerald-50 text-emerald-700',
    Cancelled: 'bg-rose-50 text-rose-700',
}

// Strip common role suffixes stored in DB names
const cleanName = (name = '') =>
    name.replace(/\b(Customer|Staff|Admin)\b/gi, '').replace(/\s+/g, ' ').trim() || name

const fmtDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return isNaN(date) ? '—' : date.toLocaleDateString('en-US', { dateStyle: 'medium' })
}
const fmtTime = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return isNaN(date) ? '' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const today = () => new Date().toISOString().split('T')[0]

const Appointments = () => {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading]           = useState(true)
    const [tab, setTab]                   = useState('All')

    // Reschedule modal state
    const [rescheduleTarget, setRescheduleTarget] = useState(null)
    const [newDate, setNewDate]                   = useState(today())
    const [newTime, setNewTime]                   = useState('09:00')
    const [saving, setSaving]                     = useState(false)

    const load = () => {
        setLoading(true)
        api.get('/appointment')
            .then(r => {
                const list = r.data?.data ?? r.data
                setAppointments(Array.isArray(list) ? list : [])
            })
            .catch(() => toast.error('Failed to load appointments.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const filtered = tab === 'All'
        ? appointments
        : appointments.filter(a => a.status === tab)

    const handleCancel = async (appt) => {
        if (!window.confirm(`Cancel appointment for ${cleanName(appt.userName)}?`)) return
        try {
            await api.put(`/appointment/${appt.appointmentId}/cancel`)
            setAppointments(prev =>
                prev.map(a => a.appointmentId === appt.appointmentId ? { ...a, status: 'Cancelled' } : a)
            )
            toast.success('Appointment cancelled.')
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to cancel.')
        }
    }

    const handleComplete = async (appt) => {
        if (!window.confirm(`Mark appointment for ${cleanName(appt.userName)} as completed?`)) return
        try {
            await api.put(`/appointment/${appt.appointmentId}/complete`)
            setAppointments(prev =>
                prev.map(a => a.appointmentId === appt.appointmentId ? { ...a, status: 'Completed' } : a)
            )
            toast.success('Appointment marked as completed.')
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to complete.')
        }
    }

    const openReschedule = (appt) => {
        setRescheduleTarget(appt)
        setNewDate(today())
        setNewTime('09:00')
    }

    const handleReschedule = async () => {
        if (!rescheduleTarget) return
        setSaving(true)
        try {
            const [hour, minute] = newTime.split(':')
            const [year, month, day] = newDate.split('-')
            const payload = {
                appointmentDate: `${year}-${month}-${day}`,
                appointmentTime: `${hour}:${minute}:00`,
                serviceType: rescheduleTarget.serviceType,
            }
            const res = await api.put(`/appointment/${rescheduleTarget.appointmentId}/reschedule`, payload)
            const updated = res.data?.data ?? res.data
            setAppointments(prev =>
                prev.map(a => a.appointmentId === rescheduleTarget.appointmentId ? { ...a, ...updated } : a)
            )
            toast.success('Appointment rescheduled.')
            setRescheduleTarget(null)
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to reschedule.')
        } finally {
            setSaving(false)
        }
    }

    const counts = TABS.slice(1).reduce((acc, t) => {
        acc[t] = appointments.filter(a => a.status === t).length
        return acc
    }, {})

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            tab === t
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t}
                        {t !== 'All' && counts[t] > 0 && (
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                t === 'Pending'   ? 'bg-amber-100 text-amber-700' :
                                t === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>{counts[t]}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                            {['Customer', 'Vehicle', 'Service', 'Date', 'Time', 'Status', ...(tab === 'Pending' || tab === 'All' ? ['Actions'] : [])].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="px-5 py-12 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                    <Loader2 size={16} className="animate-spin" /> Loading...
                                </div>
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                                No {tab !== 'All' ? tab.toLowerCase() : ''} appointments.
                            </td></tr>
                        ) : filtered.map(a => (
                            <tr key={a.appointmentId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-800">{cleanName(a.userName)}</td>
                                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{a.vehicleNumber || '—'}</td>
                                <td className="px-5 py-3 text-gray-600">{a.serviceType || '—'}</td>
                                <td className="px-5 py-3 text-gray-500">{fmtDate(a.appointmentDateTime)}</td>
                                <td className="px-5 py-3 text-gray-500">{fmtTime(a.appointmentDateTime)}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[a.status] ?? 'bg-gray-50 text-gray-600'}`}>
                                        {a.status}
                                    </span>
                                </td>
                                {(tab === 'Pending' || tab === 'All') && (
                                    <td className="px-5 py-3">
                                        {a.status === 'Pending' && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleComplete(a)} title="Mark completed" className="text-gray-400 hover:text-emerald-600 transition-colors p-1">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => openReschedule(a)} title="Reschedule" className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleCancel(a)} title="Cancel appointment" className="text-gray-400 hover:text-rose-600 transition-colors p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reschedule Modal */}
            {rescheduleTarget && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setRescheduleTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Reschedule Appointment</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{cleanName(rescheduleTarget.userName)} — {rescheduleTarget.serviceType}</p>
                            </div>
                            <button onClick={() => setRescheduleTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">New Date</label>
                                <input type="date" value={newDate} min={today()} onChange={e => setNewDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">New Time</label>
                                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setRescheduleTarget(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleReschedule} disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Appointments
