import { useState, useEffect } from 'react'
import { Trophy, CreditCard, Users, Loader2 } from 'lucide-react'
import { getCustomerReports } from '@/services/reportService'

const Reports = () => {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getCustomerReports()
            .then(res => {
                setReport(res)
            })
            .catch(() => {})
            .finally(() => {
                setLoading(false)
            })
    }, [])

    if (loading || !report) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-sm text-gray-500 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={24} />
                <span>Loading customer reports...</span>
            </div>
        )
    }

    const regulars = report.regulars ?? []
    const highSpenders = report.highSpenders ?? []
    const pendingCredits = report.pendingCredits ?? []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Reports</h1>
                <p className="text-sm text-gray-500">View insights on regulars, top spenders, and pending credits.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Regulars */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-slate-50/50">
                        <Users size={16} className="text-blue-500" />
                        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Most Regular Customers</h2>
                    </div>
                    <div className="p-0">
                        {regulars.length === 0 ? (
                            <p className="p-5 text-center text-sm text-gray-500">No data available.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody>
                                    {regulars.map((c, i) => (
                                        <tr key={c.userId} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">{i + 1}</div>
                                                <span className="font-semibold text-gray-800">{c.customerName}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-medium text-gray-600">
                                                {c.visitCount} visits
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* High Spenders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-slate-50/50">
                        <Trophy size={16} className="text-amber-500" />
                        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">High Spenders</h2>
                    </div>
                    <div className="p-0">
                        {highSpenders.length === 0 ? (
                            <p className="p-5 text-center text-sm text-gray-500">No data available.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody>
                                    {highSpenders.map((c, i) => (
                                        <tr key={c.userId} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-xs">{i + 1}</div>
                                                <span className="font-semibold text-gray-800">{c.customerName}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                                                Rs. {c.totalSpent.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Pending Credits */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden lg:col-span-2">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-slate-50/50">
                        <CreditCard size={16} className="text-rose-500" />
                        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pending Credits</h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        {pendingCredits.length === 0 ? (
                            <p className="p-5 text-center text-sm text-gray-500">No outstanding credits.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Unpaid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingCredits.map(c => (
                                        <tr key={c.userId} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-gray-800">
                                                {c.customerName}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-rose-600">
                                                Rs. {c.pendingCredit.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports