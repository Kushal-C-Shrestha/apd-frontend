import { useState, useEffect } from 'react'
import { ShoppingBag, Users, CreditCard, CalendarCheck, Loader2 } from 'lucide-react'
import { getStaffDashboard } from '@/services/dashboardService'
import Chart from 'react-apexcharts'

const STATUS = {
    Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
    Credit: 'bg-rose-50 text-rose-700 border border-rose-100/50',
    Partial: 'bg-amber-50 text-amber-700 border border-amber-100/50'
}

const Dashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getStaffDashboard()
            .then(res => setData(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-sm text-gray-500 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={24} />
                <span>Loading metrics...</span>
            </div>
        )
    }

    const stats = [
        {
            label: "Today's Sales",
            value: data.todaySalesSum > 0 ? `Rs. ${data.todaySalesSum.toLocaleString()}` : `Rs. ${data.totalSalesSum?.toLocaleString() ?? 0} (Total)`,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Total Registered Clients',
            value: (data.totalCustomersCount ?? 0).toString(),
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Total Outstanding Credits',
            value: `Rs. ${(data.pendingCreditsSum ?? 0).toLocaleString()}`,
            icon: CreditCard,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
        {
            label: "Today's Bookings",
            value: (data.todayAppointmentsCount ?? 0).toString(),
            icon: CalendarCheck,
            color: 'text-violet-600',
            bg: 'bg-violet-50'
        },
    ]

    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
    })

    const salesOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
        colors: ['#2563eb'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { categories: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })), axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (val) => `Rs. ${val.toLocaleString()}` } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.0, stops: [0, 90, 100] } },
    }
    const salesSeries = [{ name: 'Revenue', data: data.revenueChartData ?? [] }]

    const donutOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: Object.keys(data.appointmentStatusCounts ?? {}),
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'], // amber, blue, emerald, red
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '75%' } } },
        legend: { position: 'bottom' }
    }
    const donutSeries = Object.values(data.appointmentStatusCounts ?? {})

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Live operational data and transactional metrics for the service center.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex items-center gap-4 transition-all hover:shadow-sm">
                        <div className={`${bg} ${color} p-3.5 rounded-xl shrink-0`}><Icon size={20} className="stroke-[2]" /></div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                            <p className="text-base font-bold text-gray-900 truncate leading-none">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Revenue (Last 7 Days)</h2>
                    <div className="h-[300px]">
                        <Chart options={salesOptions} series={salesSeries} type="area" height="100%" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Appointments Overview</h2>
                    <div className="flex items-center justify-center h-[300px]">
                        {donutSeries.reduce((a, b) => a + b, 0) === 0 ? <p className="text-sm text-gray-400">No appointments data</p> :
                            <Chart options={donutOptions} series={donutSeries} type="donut" height="300" />}
                    </div>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100 font-medium bg-slate-50/30">
                                {['Invoice #', 'Customer / Buyer', 'Total Amount', 'Status', 'Date'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(data.recentSales ?? []).map(s => (
                                <tr key={s.saleId} className="hover:bg-blue-50/10 transition-colors">
                                    <td className="px-5 py-3.5 font-bold text-gray-800">#{s.saleId}</td>
                                    <td className="px-5 py-3.5 font-semibold text-gray-700">{s.userName || 'Walk-in Client'}</td>
                                    <td className="px-5 py-3.5 font-bold text-gray-900">Rs. {s.finalAmount.toLocaleString()}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${STATUS[s.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                                            {s.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-400 font-medium">
                                        {new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </td>
                                </tr>
                            ))}
                            {(!data.recentSales || data.recentSales.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400 italic">
                                        No sales transactions recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard