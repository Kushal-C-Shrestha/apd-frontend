import { useEffect, useState } from 'react'
import { TrendingUp, Package, Users, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminDashboard } from '@/services/dashboardService'
import Chart from 'react-apexcharts'

const STATUS = { Paid: 'bg-emerald-50 text-emerald-700', Credit: 'bg-rose-50 text-rose-700', Partial: 'bg-amber-50 text-amber-700', Unpaid: 'bg-amber-50 text-amber-700' }

const cleanName = (name = '') =>
    name.replace(/\b(Customer|Staff|Admin)\b/gi, '').replace(/\s+/g, ' ').trim() || name

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'

const Dashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminDashboard()
            .then(res => setData(res))
            .catch(() => toast.error('Failed to load dashboard data.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading || !data) return (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading dashboard...
        </div>
    )

    const stats = [
        { label: 'Total Revenue',   value: `Rs. ${data.totalRevenue?.toLocaleString() ?? 0}`, icon: TrendingUp,  color: 'text-blue-600',   bg: 'bg-blue-50' },
        { label: 'Parts in Stock',  value: data.partsInStock?.toLocaleString() ?? 0, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Staff',     value: data.totalStaff ?? 0,  icon: Users,       color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Pending Credits', value: `Rs. ${data.pendingCredits?.toLocaleString() ?? 0}`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]

    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
    })

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
        colors: ['#2563eb'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { categories: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })), axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (val) => `Rs. ${val.toLocaleString()}` } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.0, stops: [0, 90, 100] } },
    }
    const chartSeries = [{ name: 'Revenue', data: data.revenueChartData ?? [] }]



    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`${bg} ${color} p-3 rounded-lg`}><Icon size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-lg font-semibold text-gray-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue (Last 7 Days)</h2>
                <div className="h-[300px]">
                    <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Recent Sales */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Recent Sales</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                {['Customer', 'Parts', 'Total', 'Status', 'Date'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!data.recentSales || data.recentSales.length === 0) ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">No sales yet.</td></tr>
                            ) : data.recentSales.map(s => (
                                <tr key={s.saleId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-800">{cleanName(s.userName ?? s.customerName ?? '—')}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.items?.length ?? 0}</td>
                                    <td className="px-5 py-3 text-gray-800">Rs. {Number(s.finalAmount ?? 0).toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[s.paymentStatus] ?? 'bg-gray-50 text-gray-600'}`}>
                                            {s.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400">{fmt(s.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <AlertCircle size={15} className="text-rose-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Low Stock</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {(!data.lowStockParts || data.lowStockParts.length === 0) ? (
                            <p className="text-xs text-gray-400">All parts are well stocked.</p>
                        ) : data.lowStockParts.map(p => (
                            <div key={p.partId} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{p.name}</span>
                                <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{p.stockQuantity} left</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard