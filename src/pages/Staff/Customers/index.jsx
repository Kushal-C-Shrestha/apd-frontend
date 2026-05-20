import { useState, useEffect } from 'react'
import { Search, ChevronRight, X, Loader2, Calendar, ShoppingCart, Car, Phone, Mail, MapPin, User, Plus } from 'lucide-react'
import { searchCustomers, getCustomerHistory, registerCustomer } from '@/services/customerService'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    year: ''
}

const parseDataArray = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (res.data && Array.isArray(res.data)) return res.data
    if (res.Data && Array.isArray(res.Data)) return res.Data
    if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data
    return []
}

const Customers = () => {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    
    // History Drawer State
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [history, setHistory] = useState(null)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [activeTab, setActiveTab] = useState('vehicles')

    // Add Customer Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const fetchCustomers = () => {
        setLoading(true)
        searchCustomers(debouncedQuery)
            .then(res => {
                setCustomers(parseDataArray(res))
            })
            .catch(err => {
                console.error('Failed to load customers:', err)
                setCustomers([])
            })
            .finally(() => setLoading(false))
    }

    // Debounce: wait 400ms after user stops typing before updating debouncedQuery
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        fetchCustomers()
    }, [debouncedQuery])

    const handleSelectCustomer = (cus) => {
        setSelectedCustomer(cus)
        setLoadingHistory(true)
        setHistory(null)
        setActiveTab('vehicles')
        
        getCustomerHistory(cus.userId)
            .then(res => {
                const data = res.data ?? res
                setHistory(data)
            })
            .catch(err => {
                console.error(err)
                toast.error("Failed to load customer profile details.")
            })
            .finally(() => setLoadingHistory(false))
    }

    const field = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!form.fullName || !form.email || !form.phone) {
            toast.error("All required fields must be completed.")
            return
        }

        try {
            setSaving(true)
            const payload = {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                address: form.address || ''
            }

            const res = await registerCustomer(payload)
            if (res.success || res.data) {
                toast.success("Customer registered successfully!")
                setIsModalOpen(false)
                setForm(EMPTY_FORM)
                fetchCustomers()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register customer.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-5 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Customer Accounts</h1>
                    <p className="text-sm text-gray-500">Manage registered clients, review their garage, appointments, and billing histories.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                    <Plus size={14} /> Add Customer
                </button>
            </div>

            {/* Unified Search Bar */}
            <div className="relative w-full max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name, email, phone, customer ID or vehicle plates…"
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-2xs"
                />
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Loading customers...
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100 font-medium">
                                    <th className="px-5 py-3.5 text-left">Customer</th>
                                    <th className="px-5 py-3.5 text-left">Phone</th>
                                    <th className="px-5 py-3.5 text-left">Registered Vehicle</th>
                                    <th className="px-5 py-3.5 text-left">Address</th>
                                    <th className="px-5 py-3.5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customers.map(c => (
                                    <tr 
                                        key={c.userId} 
                                        onClick={() => handleSelectCustomer(c)}
                                        className="hover:bg-blue-50/20 transition-colors cursor-pointer"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {c.fullName ? c.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 truncate">{c.fullName || 'Unnamed Customer'}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3.5 text-gray-500 font-medium">{c.phone || '—'}</td>
                                        <td className="px-5 py-3.5">
                                            {c.vehicleNumber ? (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-gray-700">{c.brand} {c.model}</p>
                                                    <p className="font-mono text-[10px] text-gray-400">[{c.vehicleNumber}]</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No vehicles</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-400 max-w-[200px] truncate">{c.address || '—'}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <ChevronRight size={14} className="text-gray-300 inline" />
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <p className="font-semibold text-gray-700">No Customers Found</p>
                                                <p className="text-xs text-gray-400">Could not find any registered customers. Try creating one using the "Add Customer" button.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Register Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Register New Customer</h2>
                                <p className="text-[11px] text-gray-500">Create a client account details.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleRegister} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                            {/* Client Details Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Client Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name *</label>
                                        <input type="text" required value={form.fullName} onChange={e => field('fullName', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email Address *</label>
                                        <input type="email" required value={form.email} onChange={e => field('email', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number *</label>
                                        <input type="text" required value={form.phone} onChange={e => field('phone', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Home Address</label>
                                        <input type="text" value={form.address} onChange={e => field('address', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-150">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-gray-200 text-gray-600 text-xs py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : 'Register Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sidebar History Drawer Overlay */}
            {selectedCustomer && (
                <div 
                    className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex justify-end"
                    onClick={() => setSelectedCustomer(null)}
                >
                    <div 
                        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                    {selectedCustomer.fullName ? selectedCustomer.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-gray-900 leading-none">{selectedCustomer.fullName}</h3>
                                    <span className="text-[10px] text-gray-400 leading-none font-medium">Customer Profile</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Contact info list */}
                        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <Mail size={12} className="text-gray-400" />
                                <span>{selectedCustomer.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={12} className="text-gray-400" />
                                <span>{selectedCustomer.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-gray-400" />
                                <span className="truncate max-w-[200px]">{selectedCustomer.address || 'No address registered.'}</span>
                            </div>
                        </div>

                        {/* History Navigation Tabs */}
                        <div className="px-5 border-b border-gray-100 flex gap-4 shrink-0 bg-white">
                            {[
                                { id: 'vehicles', label: 'Garage', icon: Car },
                                { id: 'appointments', label: 'Appointments', icon: Calendar },
                                { id: 'purchases', label: 'Purchases', icon: ShoppingCart }
                            ].map(tab => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all relative ${
                                            isActive 
                                                ? 'border-blue-600 text-blue-600 font-bold' 
                                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* History Tabs Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50/30">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-20 text-xs text-gray-500 gap-2">
                                    <Loader2 size={14} className="animate-spin text-blue-500" />
                                    Loading history...
                                </div>
                            ) : !history ? (
                                <div className="text-center py-20 text-xs text-gray-400 italic">
                                    No history records loaded.
                                </div>
                            ) : (
                                <>
                                    {/* 1. VEHICLES TAB */}
                                    {activeTab === 'vehicles' && (
                                        <div className="space-y-3">
                                            {parseDataArray(history.vehicles).length === 0 ? (
                                                <div className="text-center py-10 text-xs text-gray-400 italic">
                                                    No registered vehicles found for this customer.
                                                </div>
                                            ) : (
                                                parseDataArray(history.vehicles).map(v => (
                                                    <div key={v.vehicleId} className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <h4 className="text-xs font-bold text-gray-800">{v.brand} {v.model}</h4>
                                                            <p className="text-[10px] text-gray-400">Year: {v.year || '—'}</p>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100/50 font-mono text-[10px] font-bold">
                                                            {v.vehicleNumber}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* 2. APPOINTMENTS TAB */}
                                    {activeTab === 'appointments' && (
                                        <div className="space-y-3">
                                            {parseDataArray(history.appointments).length === 0 ? (
                                                <div className="text-center py-10 text-xs text-gray-400 italic">
                                                    No appointment logs found for this customer.
                                                </div>
                                            ) : (
                                                parseDataArray(history.appointments).map(a => (
                                                    <div key={a.appointmentId} className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center justify-between gap-4">
                                                        <div className="space-y-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <h4 className="text-xs font-bold text-gray-800">{a.serviceType}</h4>
                                                                <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                                                                    • {new Date(a.appointmentDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 truncate">Vehicle Plate: {a.vehicleNumber}</p>
                                                        </div>
                                                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold leading-none ${
                                                            a.status === 'Completed' 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                                                                : a.status === 'Cancelled'
                                                                ? 'bg-red-50 text-red-700 border border-red-100/50'
                                                                : 'bg-blue-50 text-blue-700 border border-blue-100/50'
                                                        }`}>
                                                            {a.status}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* 3. PURCHASES TAB */}
                                    {activeTab === 'purchases' && (
                                        <div className="space-y-3">
                                            {parseDataArray(history.purchases).length === 0 ? (
                                                <div className="text-center py-10 text-xs text-gray-400 italic">
                                                    No invoice or billing history records found.
                                                </div>
                                            ) : (
                                                parseDataArray(history.purchases).map(s => (
                                                    <div key={s.saleId} className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3">
                                                        {/* Header */}
                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                                            <div className="space-y-0.5">
                                                                <h4 className="text-xs font-bold text-gray-800">Invoice #{s.saleId}</h4>
                                                                <p className="text-[9px] text-gray-400">{new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold text-gray-800">Rs. {s.finalAmount.toLocaleString()}</p>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-none ${
                                                                    s.paymentStatus === 'Paid'
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : 'bg-amber-50 text-amber-700'
                                                                }`}>
                                                                    {s.paymentStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Items */}
                                                        <div className="space-y-1">
                                                            {parseDataArray(s.items).map((item, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-[10px] text-gray-500">
                                                                    <span>{item.partName} <span className="text-[9px] text-gray-400">x{item.quantity}</span></span>
                                                                    <span>Rs. {item.subtotal.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Customers
