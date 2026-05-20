import { useEffect, useState } from 'react'
import { CalendarDays, Car, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks'
import { 
    getMyAppointments, 
    createAppointment, 
    rescheduleAppointment, 
    cancelAppointment 
} from '@/services/appointmentService'

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
}

const SERVICE_TYPES = [
    'Oil Change',
    'Brake Inspection',
    'Full Service',
    'Tyre Replacement',
    'Battery Check',
    'Engine Diagnostic',
    'AC Service',
    'Other',
]



const today = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const EMPTY_FORM = {
    vehicleId: '',
    date: today(),
    time: '09:00',
    serviceType: '',
}

const formatDateTime = (value) => {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

const normalizeAppointments = (input) => {
    const list = Array.isArray(input) ? input : []

    return [...list].sort((left, right) => {
        const leftTime = new Date(left.appointmentDateTime ?? left.createdAt ?? 0).getTime()
        const rightTime = new Date(right.appointmentDateTime ?? right.createdAt ?? 0).getTime()
        return rightTime - leftTime
    })
}

const Appointments = () => {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState(null)
    const [errors, setErrors] = useState({})
    const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
    const [cancelModal, setCancelModal] = useState({ show: false, appointmentId: null })

    useEffect(() => {
        if (!user?.id) return

        setLoading(true)
        getMyAppointments(user.id)
            .then(res => setAppointments(normalizeAppointments(res.data ?? res ?? [])))
            .catch(() => showToast('Failed to load appointments.', 'error'))
            .finally(() => setLoading(false))
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return

        import('@/api').then(({ default: api }) => {
            api.get('/vehicle')
                .then(response => {
                    const vehicleData = response.data?.data
                    setVehicles(Array.isArray(vehicleData) ? vehicleData : (vehicleData ? [vehicleData] : []))
                })
                .catch(() => setVehicles([]))
        })
    }, [user?.id])

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const openCreateModal = () => {
        setModalMode('create')
        setSelectedAppointmentId(null)
        setForm({ ...EMPTY_FORM, date: today() })
        setErrors({})
        setShowModal(true)
    }

    const openEditModal = (appointment) => {
        setModalMode('edit')
        setSelectedAppointmentId(appointment.appointmentId)
        
        // Find vehicle corresponding to the vehicleNumber
        const vehicle = vehicles.find(v => v.vehicleNumber === appointment.vehicleNumber)
        
        // Parse date and time from UTC/local safely
        const dt = new Date(appointment.appointmentDateTime)
        const dateStr = dt.toISOString().split('T')[0]
        const timeStr = dt.toTimeString().split(' ')[0].substring(0, 5) // "HH:MM"
        
        setForm({
            vehicleId: vehicle ? vehicle.vehicleId : (appointment.vehicleId || ''),
            date: dateStr,
            time: timeStr,
            serviceType: appointment.serviceType || '',
        })
        setErrors({})
        setShowModal(true)
    }

    const closeModal = () => {
        if (!submitting) {
            setShowModal(false)
            setSelectedAppointmentId(null)
        }
    }

    const field = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    const validate = () => {
        const nextErrors = {}

        if (!form.vehicleId) nextErrors.vehicleId = 'Select a vehicle.'
        if (!form.serviceType) nextErrors.serviceType = 'Select a service type.'
        if (!form.date) nextErrors.date = 'Select a date.'
        if (!form.time) {
            nextErrors.time = 'Select a time.'
        } else {
            const [h] = form.time.split(':').map(Number)
            if (h < 9 || h >= 17) nextErrors.time = 'Time must be between 9:00 AM and 5:00 PM.'
        }

        return nextErrors
    }

    const handleSubmit = async () => {
        const nextErrors = validate()
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setSubmitting(true)

        try {
            if (modalMode === 'create') {
                const payload = {
                    userId: Number(user.id),
                    vehicleId: Number(form.vehicleId),
                    serviceType: form.serviceType,
                    appointmentDate: form.date,
                    appointmentTime: `${form.time}:00`,
                }

                const response = await createAppointment(payload)
                const created = response.data ?? response ?? {}
                const selectedVehicle = vehicles.find(vehicle => vehicle.vehicleId === Number(form.vehicleId))
                const appointmentDateTime = created.appointmentDateTime
                    ?? created.dateTime
                    ?? `${form.date}T${form.time}:00`

                const nextAppointment = {
                    appointmentId: created.appointmentId ?? Date.now(),
                    vehicleNumber: created.vehicleNumber ?? selectedVehicle?.vehicleNumber ?? '-',
                    serviceType: created.serviceType ?? form.serviceType,
                    appointmentDateTime,
                    createdAt: created.createdAt ?? new Date().toISOString(),
                    status: created.status ?? 'Pending',
                }

                setAppointments(prev => normalizeAppointments([nextAppointment, ...prev]))
                showToast('Appointment booked successfully.')
            } else {
                const payload = {
                    appointmentDate: form.date,
                    appointmentTime: `${form.time}:00`,
                    serviceType: form.serviceType,
                    vehicleId: Number(form.vehicleId),
                }

                const response = await rescheduleAppointment(selectedAppointmentId, payload)
                const updated = response.data ?? response ?? {}
                const selectedVehicle = vehicles.find(v => v.vehicleId === Number(form.vehicleId))
                
                setAppointments(prev => prev.map(a => {
                    if (a.appointmentId === selectedAppointmentId) {
                        return {
                            ...a,
                            vehicleNumber: selectedVehicle?.vehicleNumber ?? a.vehicleNumber,
                            vehicleId: Number(form.vehicleId),
                            serviceType: updated.serviceType || form.serviceType,
                            appointmentDateTime: updated.appointmentDateTime || `${form.date}T${form.time}:00`,
                            status: updated.status || 'Pending'
                        }
                    }
                    return a
                }))
                showToast('Appointment rescheduled successfully.')
            }
            setShowModal(false)
        } catch (err) {
            // Surface the backend validation message if present
            const backendMsg =
                err?.response?.data?.message ||
                err?.response?.data?.Message ||
                err?.message
            const fallback = modalMode === 'create' ? 'Failed to book appointment.' : 'Failed to reschedule appointment.'
            showToast(backendMsg || fallback, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const triggerCancel = (appointmentId) => {
        setCancelModal({ show: true, appointmentId })
    }

    const confirmCancel = async () => {
        setSubmitting(true)
        try {
            await cancelAppointment(cancelModal.appointmentId)
            setAppointments(prev => prev.map(a => {
                if (a.appointmentId === cancelModal.appointmentId) {
                    return { ...a, status: 'Cancelled' }
                }
                return a
            }))
            showToast('Appointment cancelled successfully.')
            setCancelModal({ show: false, appointmentId: null })
        } catch {
            showToast('Failed to cancel appointment.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CalendarDays size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">My Appointments</h1>
                        <p className="text-sm text-gray-500">Review your previous bookings and schedule a new service visit.</p>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={15} /> Add Appointment
                </button>
            </div>

            {loading ? (
                <div className="rounded-xl border border-gray-100 bg-white px-5 py-10 text-center text-sm text-gray-500 shadow-sm">
                    Loading appointments...
                </div>
            ) : appointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <CalendarDays size={26} />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-gray-900">No appointments yet</h2>
                    <p className="mt-2 text-sm text-gray-500">Your previous bookings will appear here once you schedule a service.</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus size={15} /> Book your first appointment
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400">
                                {['Vehicle', 'Service', 'Date & Time', 'Status', 'Requested On', 'Actions'].map(heading => (
                                    <th key={heading} className="px-5 py-3 text-left font-medium">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appointment => {
                                const statusKey = String(appointment.status ?? 'pending').toLowerCase()

                                const isFuture = new Date(appointment.appointmentDateTime) > new Date()
                                const isCancelled = statusKey === 'cancelled'
                                const isCompleted = statusKey === 'completed'
                                const canModify = isFuture && !isCancelled && !isCompleted

                                return (
                                    <tr
                                        key={appointment.appointmentId ?? `${appointment.vehicleNumber}-${appointment.createdAt}`}
                                        className="border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 font-medium text-gray-800">
                                                <Car size={15} className="text-blue-500" />
                                                {appointment.vehicleNumber ?? '-'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">{appointment.serviceType ?? '-'}</td>
                                        <td className="px-5 py-4 text-gray-500">{formatDateTime(appointment.appointmentDateTime)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending}`}>
                                                {appointment.status ?? 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500">{formatDateTime(appointment.createdAt)}</td>
                                        <td className="px-5 py-4 text-left">
                                            {canModify ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(appointment)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Reschedule Appointment"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerCancel(appointment.appointmentId)}
                                                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                                                        title="Cancel Appointment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (() => {
                const activeVehicles = vehicles;
                const selectedVehicleId = Number(form.vehicleId);
                const hasSelectedVehicleInActive = activeVehicles.some(v => v.vehicleId === selectedVehicleId);
                
                let extraVehicleOption = null;
                if (modalMode === 'edit' && selectedVehicleId && !hasSelectedVehicleInActive) {
                    const editingAppointment = appointments.find(a => a.appointmentId === selectedAppointmentId);
                    if (editingAppointment) {
                        extraVehicleOption = {
                            vehicleId: selectedVehicleId,
                            vehicleNumber: editingAppointment.vehicleNumber,
                            brand: 'Vehicle',
                            model: editingAppointment.vehicleNumber,
                            year: ''
                        };
                    }
                }

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={closeModal}>
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                            onClick={event => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {modalMode === 'create' ? 'New Appointment' : 'Update Appointment'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {modalMode === 'create' 
                                            ? 'Choose your vehicle, service, and preferred schedule.' 
                                            : 'Update the vehicle, schedule, or service type for your appointment.'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Vehicle</label>
                                    <select
                                        value={form.vehicleId}
                                        onChange={event => field('vehicleId', event.target.value)}
                                        disabled={submitting}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.vehicleId ? 'border-rose-300' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Select a vehicle...</option>
                                        {activeVehicles.map(vehicle => (
                                            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                                {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                                            </option>
                                        ))}
                                        {extraVehicleOption && (
                                            <option key={extraVehicleOption.vehicleId} value={extraVehicleOption.vehicleId}>
                                                {extraVehicleOption.vehicleNumber} - {extraVehicleOption.brand} {extraVehicleOption.model} (Deleted/Inactive)
                                            </option>
                                        )}
                                    </select>
                                    {errors.vehicleId && <p className="text-xs text-rose-600">{errors.vehicleId}</p>}
                                    {activeVehicles.length === 0 && !extraVehicleOption && (
                                        <p className="text-xs text-gray-500">No vehicles found. Add a vehicle first.</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Service Type</label>
                                    <select
                                        value={form.serviceType}
                                        onChange={event => field('serviceType', event.target.value)}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.serviceType ? 'border-rose-300' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Select a service...</option>
                                        {SERVICE_TYPES.map(service => (
                                            <option key={service} value={service}>{service}</option>
                                        ))}
                                    </select>
                                    {errors.serviceType && <p className="text-xs text-rose-600">{errors.serviceType}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Date</label>
                                        <input
                                            type="date"
                                            min={today()}
                                            value={form.date}
                                            onChange={event => field('date', event.target.value)}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.date ? 'border-rose-300' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.date && <p className="text-xs text-rose-600">{errors.date}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Time</label>
                                        <input
                                            type="time"
                                            min="09:00"
                                            max="17:00"
                                            value={form.time}
                                            onChange={event => field('time', event.target.value)}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.time ? 'border-rose-300' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.time
                                            ? <p className="text-xs text-rose-600">{errors.time}</p>
                                            : <p className="text-xs text-gray-400">Business hours: 9:00 AM – 5:00 PM</p>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || (activeVehicles.length === 0 && !extraVehicleOption)}
                                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting 
                                        ? (modalMode === 'create' ? 'Booking...' : 'Updating...') 
                                        : (modalMode === 'create' ? 'Book Appointment' : 'Update')}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {cancelModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setCancelModal({ show: false, appointmentId: null })}>
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
                        onClick={event => event.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Cancel Appointment</h2>
                        <p className="mt-2 text-sm text-gray-500">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                        
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setCancelModal({ show: false, appointmentId: null })}
                                disabled={submitting}
                                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                No, keep it
                            </button>
                            <button
                                onClick={confirmCancel}
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                            >
                                {submitting ? 'Cancelling...' : 'Yes, cancel it'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div
                    className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
                        toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    )
}

export default Appointments
