import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ClipboardList, Loader2, RefreshCw, Check, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllRequests, updateRequestStatus } from '@/services/requestService'

const fmtDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { dateStyle: 'medium' })
}

const statusBadgeColor = (status) => {
    const s = status?.toLowerCase()
    if (s === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
    if (s === 'fulfilled') return 'bg-blue-50 text-blue-700 border-blue-100/50'
    if (s === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-100/50'
    if (s === 'available') return 'bg-amber-50 text-amber-700 border-amber-100/50'
    return 'bg-slate-50 text-slate-600 border-slate-100'
}

const statusIcon = (status) => {
    const s = status?.toLowerCase()
    if (s === 'approved' || s === 'fulfilled') return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
    if (s === 'rejected') return <XCircle size={13} className="text-rose-500 shrink-0" />
    return <Clock size={13} className="text-slate-400 shrink-0" />
}

const AdminRequests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState(null)

    const fetchRequests = () => {
        setLoading(true)
        getAllRequests()
            .then((res) => {
                const list = res?.data ?? res
                setRequests(Array.isArray(list) ? list : [])
            })
            .catch(() => toast.error('Failed to load part requests.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleSettle = async (requestId, nextStatus) => {
        setActionId(requestId)
        try {
            const res = await updateRequestStatus(requestId, nextStatus)
            const updated = res?.data ?? res
            
            // Map status update locally
            setRequests((prev) =>
                prev.map((r) => (r.requestId === requestId ? { ...r, status: updated.status } : r))
            )
            toast.success(`Part request status updated to "${nextStatus}".`)
        } catch (error) {
            const errMsg = error.response?.data?.message ?? `Failed to change status to ${nextStatus}.`
            toast.error(errMsg)
        } finally {
            setActionId(null)
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Part Requests</h1>
                    <p className="text-sm text-gray-500">
                        View and settle customer requests for unavailable auto parts.
                    </p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 border border-gray-200 hover:bg-slate-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                >
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" /> Loading requested parts list...
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-400 text-sm">
                    No part requests logged yet.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Customer</th>
                                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Requested Part</th>
                                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Stock Status</th>
                                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Request Status</th>
                                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Date Logged</th>
                                    <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[10px]">Action Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {requests.map((r) => {
                                    const requestedQty = r.quantity ?? 1
                                    const stockQty = r.partStockQuantity ?? 0
                                    const isOutOfStock = stockQty < requestedQty
                                    const isPending = r.status === 'Pending'

                                    return (
                                        <tr key={r.requestId} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-800 leading-tight">
                                                    {r.customerName || 'Unknown Customer'}
                                                </div>
                                                {r.customerEmail && (
                                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                        {r.customerEmail}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-700">{r.partName}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    Requested Qty: <strong className="text-gray-600">{requestedQty}</strong>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            isOutOfStock
                                                                ? 'bg-rose-50 text-rose-700 border-rose-100/50'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                                                        }`}
                                                    >
                                                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({stockQty} available)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeColor(
                                                        r.status
                                                    )}`}
                                                >
                                                    {statusIcon(r.status)}
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500 font-medium">
                                                {fmtDate(r.createdAt)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {isPending ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isOutOfStock ? (
                                                            <div className="flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 border border-rose-100/50 px-2 py-1.5 rounded-lg font-medium">
                                                                <AlertTriangle size={12} /> Stock Insufficient
                                                            </div>
                                                        ) : null}
                                                        
                                                        <button
                                                            disabled={actionId !== null || isOutOfStock}
                                                            onClick={() => handleSettle(r.requestId, 'Available')}
                                                            title="Mark Available"
                                                            className={`p-2 rounded-lg transition-all border ${
                                                                isOutOfStock
                                                                    ? 'bg-slate-50 text-slate-300 border-slate-150 cursor-not-allowed shadow-none'
                                                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100 hover:scale-105 active:scale-95 shadow-sm'
                                                            }`}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            disabled={actionId !== null}
                                                            onClick={() => handleSettle(r.requestId, 'Rejected')}
                                                            title="Reject"
                                                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">Settled</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminRequests
