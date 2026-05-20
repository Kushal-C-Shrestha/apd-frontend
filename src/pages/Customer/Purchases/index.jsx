import { useEffect, useState } from 'react'
import { ShoppingCart, Loader2, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks'
import { getMyPurchases } from '@/services/purchaseService'

const parseArr = (v) => {
    if (Array.isArray(v)) return v
    if (v?.data && Array.isArray(v.data)) return v.data
    if (v?.Data && Array.isArray(v.Data)) return v.Data
    return []
}

const fmt = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

const PAYMENT_STYLES = {
    Paid:    'bg-emerald-50 text-emerald-700',
    Unpaid:  'bg-amber-50 text-amber-700',
    Partial: 'bg-orange-50 text-orange-700',
    Credit:  'bg-blue-50 text-blue-700',
}

// Returns "Part A" or "Part A +2 more"
const itemsLabel = (items) => {
    if (!items.length) return '—'
    const first = items[0].partName ?? 'Part'
    if (items.length === 1) return first
    return `${first} +${items.length - 1} more`
}

const MyPurchases = () => {
    const { user } = useAuth()
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        if (!user?.id) return
        setLoading(true)
        setError(null)
        getMyPurchases(user.id)
            .then(res => {
                const list = parseArr(res?.data ?? res)
                setPurchases([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
            })
            .catch(() => setError('Failed to load your purchase history. Please try again later.'))
            .finally(() => setLoading(false))
    }, [user?.id])

    const totalSpent = purchases.reduce((sum, p) => sum + (p.finalAmount ?? 0), 0)

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">My Purchases</h1>
                <p className="text-sm text-gray-500">A complete history of your parts purchases and service invoices.</p>
            </div>

            {/* Summary Bar */}
            {!loading && !error && purchases.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Invoices', value: purchases.length },
                        { label: 'Total Spent',    value: `Rs. ${totalSpent.toLocaleString()}` },
                        { label: 'Unpaid',         value: purchases.filter(p => p.paymentStatus !== 'Paid').length },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-xs px-5 py-4">
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                    Loading your purchases...
                </div>
            ) : error ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-6 py-8 text-center text-sm text-rose-600">
                    {error}
                </div>
            ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-xs">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
                        <ShoppingCart size={24} />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">No purchases yet</h2>
                    <p className="mt-1 max-w-xs text-sm text-gray-500">
                        Your invoices will appear here once parts have been billed to your account.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100 font-medium">
                                <th className="px-5 py-3.5 text-left">Date</th>
                                <th className="px-5 py-3.5 text-left">Items</th>
                                <th className="px-5 py-3.5 text-left">Status</th>
                                <th className="px-5 py-3.5 text-right">Amount</th>
                                <th className="px-5 py-3.5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {purchases.map(p => {
                                const items = parseArr(p.items ?? p.saleItems)
                                const isOpen = expanded === p.saleId
                                const statusStyle = PAYMENT_STYLES[p.paymentStatus] ?? 'bg-gray-50 text-gray-600'

                                return (
                                    <>
                                        <tr
                                            key={p.saleId}
                                            onClick={() => setExpanded(isOpen ? null : p.saleId)}
                                            className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                                        >
                                            {/* Date */}
                                            <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                                                {fmt(p.createdAt)}
                                            </td>

                                            {/* Items label */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-medium text-gray-800">
                                                    {itemsLabel(items)}
                                                </span>
                                            </td>

                                            {/* Status badge */}
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle}`}>
                                                    {p.paymentStatus ?? 'Unknown'}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap">
                                                Rs. {(p.finalAmount ?? 0).toLocaleString()}
                                            </td>

                                            {/* Expand chevron */}
                                            <td className="px-5 py-3.5 text-right">
                                                <ChevronDown
                                                    size={14}
                                                    className={`inline text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </td>
                                        </tr>

                                        {/* Expanded breakdown row */}
                                        {isOpen && (
                                            <tr key={`${p.saleId}-detail`} className="bg-slate-50/60">
                                                <td colSpan={5} className="px-5 py-4">
                                                    {items.length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic">No line items recorded.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {/* Items mini-table */}
                                                            <table className="w-full text-xs">
                                                                <thead>
                                                                    <tr className="text-gray-400">
                                                                        <th className="text-left font-medium pb-1.5">Part</th>
                                                                        <th className="text-center font-medium pb-1.5">Qty</th>
                                                                        <th className="text-right font-medium pb-1.5">Unit Price</th>
                                                                        <th className="text-right font-medium pb-1.5">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {items.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="py-1.5 text-gray-700 font-medium">{item.partName ?? 'Part'}</td>
                                                                            <td className="py-1.5 text-center text-gray-500">{item.quantity ?? 1}</td>
                                                                            <td className="py-1.5 text-right text-gray-500">Rs. {(item.unitPrice ?? 0).toLocaleString()}</td>
                                                                            <td className="py-1.5 text-right font-semibold text-gray-800">Rs. {(item.subtotal ?? 0).toLocaleString()}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                            {/* Totals footer */}
                                                            <div className="border-t border-gray-200 pt-2 flex flex-col items-end gap-1 text-xs">
                                                                {p.discount > 0 && (
                                                                    <span className="text-emerald-600 font-medium">
                                                                        Discount: − Rs. {p.discount.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    Total: Rs. {(p.finalAmount ?? 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default MyPurchases