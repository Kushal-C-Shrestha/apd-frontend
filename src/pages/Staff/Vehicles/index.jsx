import { useState, useEffect } from 'react'
import { Search, Loader2, Car, User, Plus, X, Hash, Calendar, Layers, Image as ImageIcon } from 'lucide-react'
import { getAllVehicles, createVehicle, searchCustomers } from '@/services/customerService'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
    userId: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    year: '',
    imageUrl: ''
}

const parseDataArray = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (res.data && Array.isArray(res.data)) return res.data
    if (res.Data && Array.isArray(res.Data)) return res.Data
    if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data
    return []
}

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([])
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const fetchVehicles = () => {
        setLoading(true)
        getAllVehicles()
            .then(res => {
                setVehicles(parseDataArray(res))
            })
            .catch(err => {
                console.error('Failed to load vehicles:', err)
                setVehicles([])
            })
            .finally(() => setLoading(false))
    }

    const fetchCustomers = () => {
        searchCustomers('')
            .then(res => {
                setCustomers(parseDataArray(res))
            })
            .catch(err => {
                console.error('Failed to load customers:', err)
                setCustomers([])
            })
    }

    useEffect(() => {
        fetchVehicles()
        fetchCustomers()
    }, [])

    const field = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleAddVehicle = async (e) => {
        e.preventDefault()
        if (!form.userId || !form.vehicleNumber || !form.brand || !form.model) {
            toast.error("Please fill in all required fields.")
            return
        }

        try {
            setSaving(true)
            const payload = {
                userId: Number(form.userId),
                vehicleNumber: form.vehicleNumber.trim(),
                brand: form.brand.trim(),
                model: form.model.trim(),
                year: form.year ? Number(form.year) : null,
                imageUrl: form.imageUrl.trim() || null
            }

            const res = await createVehicle(payload)
            if (res.success || res.data) {
                toast.success("Vehicle registered successfully!")
                setIsModalOpen(false)
                setForm(EMPTY_FORM)
                fetchVehicles()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register vehicle.')
        } finally {
            setSaving(false)
        }
    }

    const filtered = vehicles.filter(v => {
        if (!query) return true
        const q = query.toLowerCase()
        return (
            (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
            (v.brand && v.brand.toLowerCase().includes(q)) ||
            (v.model && v.model.toLowerCase().includes(q)) ||
            (v.ownerName && v.ownerName.toLowerCase().includes(q))
        );
    })

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Garage Registry</h1>
                    <p className="text-sm text-gray-500">View and track all customer registered vehicles currently registered with the system.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                    <Plus size={14} /> Add Vehicle
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by brand, plate, or owner…"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-2xs"
                />
            </div>

            {/* Loading / Empty / Content states */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-500 gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Loading registered vehicles...
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-400 gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Car size={20} className="text-gray-500" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-gray-700">No Vehicles Found</p>
                        <p className="text-xs text-gray-400">Could not find any vehicles matching your search criteria.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(v => (
                        <div key={v.vehicleId} className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col">
                            {/* Image container */}
                            <div className="h-44 w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                                {v.imageUrl ? (
                                    <img 
                                        src={v.imageUrl} 
                                        alt={`${v.brand} ${v.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-300 gap-1.5 select-none">
                                        <Car size={36} className="stroke-[1.5]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400/80">No Photo</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold tracking-wide shadow-xs border border-white/10">
                                        {v.vehicleNumber}
                                    </span>
                                </div>
                            </div>

                            {/* Details body */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-gray-800 leading-none">
                                        {v.brand} {v.model}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">Year Model: {v.year || '—'}</p>
                                </div>

                                {/* Owner Info Footer */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-50 bg-slate-50/30 -mx-4 -mb-4 p-3 px-4 shrink-0">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        <User size={12} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-medium text-gray-400 leading-none">Owner / Client</p>
                                        <p className="text-xs font-bold text-gray-700 truncate">{v.ownerName || 'Unknown Owner'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Register New Vehicle Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Register New Vehicle</h2>
                                <p className="text-[11px] text-gray-500">Add a client vehicle to the service center garage.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
                            {/* Select Owner */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><User size={10} /> Owner / Customer *</label>
                                <select 
                                    required 
                                    value={form.userId} 
                                    onChange={e => field('userId', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white"
                                >
                                    <option value="">-- Select Owner --</option>
                                    {customers.map(c => (
                                        <option key={c.userId} value={c.userId}>
                                            {c.fullName} ({c.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Plate Number */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Hash size={10} /> License Plate Number *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. BA-1234" 
                                    value={form.vehicleNumber} 
                                    onChange={e => field('vehicleNumber', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Brand */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Layers size={10} /> Brand *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Toyota" 
                                        value={form.brand} 
                                        onChange={e => field('brand', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" 
                                    />
                                </div>
                                {/* Model */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Car size={10} /> Model *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Corolla" 
                                        value={form.model} 
                                        onChange={e => field('model', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Year */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Calendar size={10} /> Model Year</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 2022" 
                                        value={form.year} 
                                        onChange={e => field('year', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" 
                                    />
                                </div>
                                {/* Image Url */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><ImageIcon size={10} /> Image URL</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. https://image-url.com" 
                                        value={form.imageUrl} 
                                        onChange={e => field('imageUrl', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/30 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-150">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-gray-200 text-gray-600 text-xs py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : 'Register Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Vehicles