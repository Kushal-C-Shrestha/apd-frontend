import { useState, useEffect } from 'react'
import { Star, Plus, X, MessageSquare, Loader2, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks'
import { createReview, getMyReviews } from '@/services/reviewService'
import { getMyAppointments } from '@/services/appointmentService'
import toast from 'react-hot-toast'

const Stars = ({ value, onChange }) => {
    const [hover, setHover] = useState(null)
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange?.(n)}
                    onMouseEnter={() => onChange && setHover(n)}
                    onMouseLeave={() => onChange && setHover(null)}
                    className={onChange ? 'cursor-pointer focus:outline-none transition-transform active:scale-90' : 'cursor-default'}
                >
                    <Star
                        size={26}
                        className={`transition-colors duration-150 ${
                            n <= (hover ?? value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-100 text-slate-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    )
}

const parseDataArray = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (res.data && Array.isArray(res.data)) return res.data
    if (res.Data && Array.isArray(res.Data)) return res.Data
    if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data
    if (res.data && res.data.Data && Array.isArray(res.data.Data)) return res.data.Data
    return []
}

const getFriendlyErrorMessage = (error) => {
    const rawMsg = error.response?.data?.message || error.message || ''
    const lower = rawMsg.toLowerCase()
    
    if (lower.includes('already exists') || lower.includes('already reviewed')) {
        return "This appointment has already been reviewed."
    }
    if (lower.includes('not found')) {
        return "Record not found."
    }
    if (lower.includes('rating')) {
        return "Please select a rating."
    }
    
    if (rawMsg.length > 50) {
        return "Failed to submit review."
    }
    return rawMsg || "Failed to submit review."
}

const Reviews = () => {
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [appointments, setAppointments] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [appointmentId, setAppointmentId] = useState('')
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!user?.id) return
        setLoading(true)

        // Fetch user reviews
        getMyReviews(user.id)
            .then(res => {
                setReviews(parseDataArray(res))
            })
            .catch(err => {
                console.error('Failed to load reviews list:', err)
            })

        // Fetch user appointments
        getMyAppointments(user.id)
            .then(res => {
                setAppointments(parseDataArray(res))
            })
            .catch(err => {
                console.error('Failed to load appointments list:', err)
            })

        // Fetch customer vehicles safely
        import('@/api').then(({ default: api }) => {
            api.get('/vehicle')
                .then(res => {
                    setVehicles(parseDataArray(res))
                })
                .catch(err => {
                    console.error('Failed to load vehicles list:', err)
                    setVehicles([])
                })
                .finally(() => {
                    setLoading(false)
                })
        })
    }, [user?.id])

    const unreviewedAppointments = appointments.filter(appt => {
        const isReviewed = reviews.some(r => r.appointmentId === appt.appointmentId)
        return !isReviewed
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!appointmentId || !rating) return
        setSubmitting(true)
        try {
            const payload = {
                userId: Number(user.id),
                appointmentId: Number(appointmentId),
                rating,
                comment: comment.trim() || null
            }
            const res = await createReview(payload)
            const created = res.data ?? res
            
            setReviews(prev => [created, ...prev])
            toast.success('Review submitted successfully.')
            setModal(false)
            setAppointmentId('')
            setRating(0)
            setComment('')
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Service Feedback</h1>
                    <p className="text-sm text-gray-500">Provide reviews on your completed service appointments.</p>
                </div>
                <button
                    onClick={() => {
                        if (unreviewedAppointments.length === 0) {
                            toast.error("No unreviewed appointments found.")
                            return
                        }
                        setModal(true)
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
                >
                    <Plus size={15} /> Add Review
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Loading your reviews...
                </div>
            ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-400 gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageSquare size={20} className="text-gray-500" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-gray-700">No Reviews Yet</p>
                        <p className="text-xs text-gray-400">Your submitted appointment feedback logs will be displayed here.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(r => {
                        const appt = appointments.find(a => a.appointmentId === r.appointmentId)
                        const vehicleDetails = appt ? vehicles.find(v => v.vehicleNumber === appt.vehicleNumber || v.vehicleId === appt.vehicleId) : null

                        const vehicleLabel = appt 
                            ? (vehicleDetails 
                                ? `${vehicleDetails.brand} ${vehicleDetails.model} [${appt.vehicleNumber}]`
                                : `Plate: ${appt.vehicleNumber}`)
                            : 'Unknown Vehicle'

                        const title = `${appt ? appt.serviceType : 'Service Appointment'} — ${vehicleLabel}`

                        return (
                            <div key={r.reviewId} className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center justify-between gap-6 hover:shadow-sm transition-all">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-bold text-gray-800 leading-none truncate">
                                            {title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                            • {new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                    {r.comment ? (
                                        <p className="text-xs text-gray-500 leading-relaxed truncate max-w-3xl italic">
                                            "{r.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-gray-300 italic">No comment left.</p>
                                    )}
                                </div>

                                <div className="shrink-0">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100/50 flex items-center gap-1">
                                        ★ {r.rating}/5
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/35 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => !submitting && setModal(false)}>
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-250" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h2 className="text-base font-bold text-gray-900">Add Service Review</h2>
                                <p className="text-xs text-gray-400">Share your rating and experience with our service staff.</p>
                            </div>
                            <button 
                                type="button" 
                                disabled={submitting}
                                onClick={() => setModal(false)} 
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Appointment Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 block">Select Appointment</label>
                                <select 
                                    required
                                    value={appointmentId} 
                                    onChange={e => setAppointmentId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Choose an appointment...</option>
                                    {unreviewedAppointments.map(a => (
                                        <option key={a.appointmentId} value={a.appointmentId}>
                                            {a.serviceType} — {new Date(a.appointmentDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stars Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 block">Rating</label>
                                <div className="py-1 px-1 bg-slate-50/50 rounded-xl border border-slate-100/50 flex items-center justify-center">
                                    <Stars value={rating} onChange={setRating} />
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 block">
                                    Comment <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea 
                                    value={comment} 
                                    onChange={e => setComment(e.target.value)} 
                                    rows={3} 
                                    maxLength={500}
                                    placeholder="Write your review here..."
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed" 
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button 
                                type="button"
                                disabled={submitting} 
                                onClick={() => setModal(false)} 
                                className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={!appointmentId || !rating || submitting}
                                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Reviews
