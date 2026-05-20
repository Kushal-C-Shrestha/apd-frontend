import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllReviews } from '@/services/reviewService'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'

const Reviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllReviews()
            .then(res => {
                const list = res?.data ?? res
                setReviews(Array.isArray(list) ? list : [])
            })
            .catch(() => toast.error('Failed to load reviews.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin text-blue-500" /> Loading reviews...
        </div>
    )

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Reviews</h1>
                <p className="text-sm text-gray-500">Read what customers are saying about completed vehicle services.</p>
            </div>
            
            {reviews.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-400 text-sm">
                    No reviews yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(r => {
                        const customer = r.customerName ?? r.userName ?? 'Customer'
                        const service = r.serviceType ?? r.service ?? 'Service Appointment'
                        const title = `${customer} — ${service}`

                        return (
                            <div key={r.reviewId ?? r.id} className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center justify-between gap-6 hover:shadow-sm transition-all">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-bold text-gray-800 leading-none truncate">
                                            {title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                            • {fmt(r.createdAt ?? r.date)}
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
                                        ★ {r.rating ?? 0}/5
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Reviews
