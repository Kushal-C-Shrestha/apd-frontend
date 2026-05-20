import { useState, useEffect } from 'react'
import { Package, ShoppingCart, ClipboardList, X, Loader2, Plus, Minus } from 'lucide-react'
import { useAuth } from '@/hooks'
import { getAllParts } from '@/services/partService'
import { createRequest, getMyRequests } from '@/services/requestService'
import { createSale } from '@/services/saleService'
import toast from 'react-hot-toast'

const TABS = ['Browse', 'Requested']

const Parts = () => {
    const { user } = useAuth()
    const [tab, setTab] = useState('Browse')
    const [parts, setParts] = useState([])
    const [requests, setRequests] = useState([])
    const [loadingParts, setLoadingParts] = useState(true)
    const [loadingRequests, setLoadingRequests] = useState(false)
    const [modal, setModal] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        getAllParts()
            .then(res => setParts(res.data ?? res ?? []))
            .catch(() => toast.error('Failed to load parts.'))
            .finally(() => setLoadingParts(false))
    }, [])

    useEffect(() => {
        if (tab !== 'Requested' || !user?.id) return
        setLoadingRequests(true)
        getMyRequests(user.id)
            .then(res => setRequests(res.data ?? res ?? []))
            .catch(() => toast.error('Failed to load requests.'))
            .finally(() => setLoadingRequests(false))
    }, [tab, user?.id])

    const openModal = (type, part) => {
        setQuantity(1)
        setModal({ type, part })
    }

    const closeModal = () => {
        if (!submitting) setModal(null)
    }

    const handleBuy = async () => {
        setSubmitting(true)
        try {
            const qty = Math.max(1, quantity)
            const subtotal = modal.part.unitPrice * qty
            const discount = subtotal > 5000 ? subtotal * 0.1 : 0
            const finalTotal = subtotal - discount
            const payload = {
                userId: Number(user.id),
                items: [{
                    partId: modal.part.partId,
                    quantity: qty
                }],
                discount: discount,
                amountPaid: finalTotal
            }
            await createSale(payload)

            // Deduct locally
            setParts(prev => prev.map(p => {
                if (p.partId === modal.part.partId) {
                    return {
                        ...p,
                        stockQuantity: Math.max(0, p.stockQuantity - qty)
                    }
                }
                return p
            }))

            toast.success(`Successfully purchased ${qty}x ${modal.part.name}!`)
            setModal(null)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete purchase.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRequest = async () => {
        setSubmitting(true)
        try {
            const qty = Math.max(1, quantity)
            const res = await createRequest({
                userId: Number(user.id),
                partId: modal.part.partId,
                quantity: qty,
            })
            const created = res.data ?? res
            setRequests(prev => [created, ...prev])
            toast.success(`Request submitted for ${modal.part.name}.`)
            setModal(null)
        } catch {
            toast.error('Failed to submit request.')
        } finally {
            setSubmitting(false)
        }
    }

    const inStock = (part) => (part.stockQuantity ?? 0) > 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Vehicle Parts</h1>
                    <p className="text-sm text-gray-500">Browse available parts for purchase or request new stock from our inventory.</p>
                </div>

                <div className="flex rounded-lg p-1 bg-gray-100/80 self-start">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tab === t
                                    ? 'bg-white text-blue-600 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t === 'Browse' ? <Package size={14} /> : <ClipboardList size={14} />}
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'Browse' && (
                loadingParts ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        Loading parts catalog...
                    </div>
                ) : parts.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-500 text-sm">
                        No parts available in the catalog at the moment.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {parts.map(part => {
                            const isAvailable = inStock(part)
                            return (
                                <div key={part.partId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-250/50 transition-all overflow-hidden flex flex-col justify-between group relative">
                                    {/* Card Image Cover */}
                                    <div className="h-40 w-full relative bg-slate-50 border-b border-gray-50 overflow-hidden shrink-0">
                                        {part.imageUrl ? (
                                            <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-50/70 to-indigo-100/40 flex flex-col items-center justify-center gap-2">
                                                <Package size={36} className="text-blue-500/70" />
                                                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600/50">No Photo</span>
                                            </div>
                                        )}
                                        {/* Status Badge Float */}
                                        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs ${isAvailable
                                                ? 'bg-emerald-500/90 text-white'
                                                : 'bg-rose-500/90 text-white'
                                            }`}>
                                            {isAvailable ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>

                                    {/* Card Content Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3.5">
                                            {/* Product Labels */}
                                            <div>
                                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">Spare Part</span>
                                                <h3 className="font-bold text-gray-900 text-base leading-tight mt-0.5">{part.name}</h3>
                                                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 h-8 leading-relaxed">
                                                    {part.description || 'No description available for this inventory item.'}
                                                </p>
                                            </div>

                                            {/* Specifications Panel */}
                                            <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-slate-50/70 rounded-xl border border-slate-100/50">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Unit Price</span>
                                                    <span className="text-sm font-bold text-gray-900 block">
                                                        Rs. {Number(part.unitPrice ?? 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="space-y-0.5 border-l border-gray-200/60 pl-4">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Inventory</span>
                                                    <span className="text-xs font-semibold text-gray-600 block">
                                                        {isAvailable ? `${part.stockQuantity} units` : 'Unavailable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer Divider & Button */}
                                        <div className="pt-3 border-t border-gray-50 shrink-0">
                                            {isAvailable ? (
                                                <button
                                                    onClick={() => openModal('buy', part)}
                                                    className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-xs"
                                                >
                                                    <ShoppingCart size={14} /> Buy Now
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openModal('request', part)}
                                                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                                                >
                                                    <ClipboardList size={14} /> Request Restock
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {tab === 'Requested' && (
                loadingRequests ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        Loading requested parts history...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-500 text-sm">
                        You haven't requested any parts yet.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400">
                                    {['Part Name', 'Quantity', 'Requested On', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, idx) => {
                                    const status = String(req.status ?? 'Pending')
                                    const statusStyle = status.toLowerCase() === 'approved' || status.toLowerCase() === 'fulfilled'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : status.toLowerCase() === 'rejected'
                                            ? 'bg-rose-50 text-rose-700'
                                            : 'bg-amber-50 text-amber-700'

                                    return (
                                        <tr key={req.requestId ?? idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-b-0">
                                            <td className="px-5 py-4 font-medium text-gray-800">{req.partName ?? req.part?.name ?? 'Part'}</td>
                                            <td className="px-5 py-4 text-gray-500 font-medium">{req.quantity ?? 1}</td>
                                            <td className="px-5 py-4 text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '-'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900">
                                {modal.type === 'buy' ? 'Confirm Purchase' : 'Request Restock'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{modal.part.name}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">Unit Price: Rs. {Number(modal.part.unitPrice ?? 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-gray-600">Quantity</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        disabled={quantity <= 1 || submitting}
                                        onClick={() => setQuantity(q => q - 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center disabled:opacity-50"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm font-semibold text-gray-800 w-6 text-center">{quantity}</span>
                                    <button
                                        disabled={(modal.type === 'buy' && quantity >= (modal.part.stockQuantity ?? 0)) || submitting}
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center disabled:opacity-50"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {modal.type === 'buy' && (() => {
                                const subtotal = modal.part.unitPrice * quantity
                                const discount = subtotal > 5000 ? subtotal * 0.1 : 0
                                const total = subtotal - discount
                                return (
                                    <div className="space-y-2 border-t border-gray-100 pt-3">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Subtotal</span>
                                            <span>Rs. {subtotal.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                                                <span>Loyalty Discount (10%)</span>
                                                <span>- Rs. {discount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-sm font-medium text-gray-900">Total Price</span>
                                            <span className="text-xl font-bold text-gray-900">
                                                Rs. {total.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {subtotal <= 5000 && (
                                            <p className="text-[10px] text-gray-400 text-right mt-1">
                                                Spend more than Rs. 5,000.00 to unlock a 10% loyalty discount!
                                            </p>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={submitting}
                                onClick={closeModal}
                                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            {modal.type === 'buy' ? (
                                <button
                                    disabled={submitting}
                                    onClick={handleBuy}
                                    className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Order'}
                                </button>
                            ) : (
                                <button
                                    disabled={submitting}
                                    onClick={handleRequest}
                                    className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Parts