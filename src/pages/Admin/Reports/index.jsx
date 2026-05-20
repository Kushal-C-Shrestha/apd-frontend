import { useEffect, useState } from 'react'
import { BarChart3, Loader2, TrendingUp, Package, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFinancialReport } from '@/services/reportService'

const Reports = () => {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('All Time')

    useEffect(() => {
        setLoading(true)
        getFinancialReport(timeframe)
            .then(res => {
                setReport(res)
            })
            .catch(() => toast.error('Failed to load report data.'))
            .finally(() => setLoading(false))
    }, [timeframe])

    if (loading && !report) return (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin text-blue-500" /> Loading reports...
        </div>
    )

    const totalRevenue    = report?.totalRevenue ?? 0
    const totalDiscount   = report?.totalDiscounts ?? 0
    const pendingCredit   = report?.pendingCredits ?? 0
    const totalInvoices   = report?.totalInvoices ?? 0
    const paidSales       = report?.paidSalesCount ?? 0
    const unpaidSales     = report?.unpaidSalesCount ?? 0
    const lowStockParts   = report?.lowStockParts ?? []
    const topParts        = report?.topStockedParts ?? []
    const totalStock      = topParts.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500">Summary of sales performance and inventory status.</p>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Financial Overview</h2>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
                    <select 
                        value={timeframe} 
                        onChange={e => setTimeframe(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
                    >
                        <option value="All Time">All Time</option>
                        <option value="Today">Daily (Today)</option>
                        <option value="This Month">Monthly (This Month)</option>
                        <option value="This Year">Yearly (This Year)</option>
                    </select>
                </div>
            </div>

            {/* Sales summary */}
            <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue',    value: `Rs. ${totalRevenue.toLocaleString()}`,  color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
                        { label: 'Total Discounts',  value: `Rs. ${totalDiscount.toLocaleString()}`, color: 'text-amber-600',   bg: 'bg-amber-50',   icon: TrendingUp },
                        { label: 'Pending Credits',  value: `Rs. ${pendingCredit.toLocaleString()}`, color: 'text-rose-600',    bg: 'bg-rose-50',    icon: AlertCircle },
                        { label: 'Total Invoices',   value: totalInvoices,                            color: 'text-blue-600',    bg: 'bg-blue-50',    icon: BarChart3 },
                    ].map(({ label, value, color, bg, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`${bg} ${color} p-3 rounded-lg`}><Icon size={18} /></div>
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className="text-lg font-bold text-gray-900">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Payment Status Breakdown</h2>
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Paid: <span className="font-bold">{paidSales}</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Unpaid/Credit: <span className="font-bold">{unpaidSales}</span></div>
                </div>
                {totalInvoices > 0 && (
                    <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(paidSales / totalInvoices) * 100}%` }} />
                        <div className="h-full bg-rose-400 transition-all" style={{ width: `${(unpaidSales / totalInvoices) * 100}%` }} />
                    </div>
                )}
            </div>

            {/* Inventory */}
            <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Inventory</h2>
                <div className="grid lg:grid-cols-2 gap-4">
                    {/* Low stock */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <AlertCircle size={14} className="text-rose-500" />
                            <h3 className="text-sm font-semibold text-gray-700">Low Stock Parts (&lt;10)</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {lowStockParts.length === 0 ? (
                                <p className="text-xs text-gray-400">No low-stock items.</p>
                            ) : lowStockParts.map(p => (
                                <div key={p.partId} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{p.name}</span>
                                    <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{p.stockQuantity} left</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top stocked */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Package size={14} className="text-emerald-500" />
                            <h3 className="text-sm font-semibold text-gray-700">Highest Stock (Total: {totalStock})</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {topParts.map(p => (
                                <div key={p.partId} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{p.name}</span>
                                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{p.stockQuantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports