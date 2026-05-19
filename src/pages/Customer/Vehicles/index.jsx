import { useState, useEffect } from 'react'
import { Plus, Car, X, Loader2, Edit2, Trash2 } from 'lucide-react'
import api from '@/api'
import toast from 'react-hot-toast'

const EMPTY = { vehicleNumber: '', brand: '', model: '', year: '', imageUrl: '' }

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editingId, setEditingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    useEffect(() => {
        fetchVehicle()
    }, [])

    const fetchVehicle = async () => {
        try {
            setLoading(true)
            const res = await api.get('/vehicle')
            if (res.data?.data) {
                setVehicles(Array.isArray(res.data.data) ? res.data.data : [res.data.data])
            } else {
                setVehicles([])
            }
        } catch (error) {
            console.error('Failed to fetch vehicle', error)
        } finally {
            setLoading(false)
        }
    }

    const field = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file.')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be under 2MB.')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            field('imageUrl', reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setForm({
                vehicleNumber: vehicle.vehicleNumber,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year || '',
                imageUrl: vehicle.imageUrl || ''
            })
            setEditingId(vehicle.vehicleId)
        } else {
            setForm(EMPTY)
            setEditingId(null)
        }
        setModal(true)
    }

    const handleSave = async () => {
        if (!form.vehicleNumber || !form.brand) {
            toast.error("Vehicle Number and Brand are required");
            return;
        }
        
        try {
            setSaving(true)
            const payload = {
                vehicleNumber: form.vehicleNumber,
                brand: form.brand,
                model: form.model,
                year: form.year ? Number(form.year) : null,
                imageUrl: form.imageUrl || null
            }
            
            if (editingId) {
                const res = await api.put(`/vehicle/${editingId}`, payload)
                if (res.data?.success) {
                    toast.success('Vehicle updated successfully')
                    setVehicles(prev => prev.map(v => v.vehicleId === editingId ? res.data.data : v))
                    setModal(false)
                }
            } else {
                const res = await api.post('/vehicle', payload)
                if (res.data?.success) {
                    toast.success('Vehicle added successfully')
                    setVehicles(prev => [...prev, res.data.data])
                    setModal(false)
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save vehicle')
        } finally {
            setSaving(false)
        }
    }

    const requestDelete = (vehicleId) => {
        setConfirmDeleteId(vehicleId)
    }

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        
        try {
            setDeletingId(confirmDeleteId)
            const res = await api.delete(`/vehicle/${confirmDeleteId}`)
            if (res.data?.success) {
                toast.success('Vehicle deleted successfully')
                setVehicles(prev => prev.filter(v => v.vehicleId !== confirmDeleteId))
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete vehicle')
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">My Vehicles</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <Plus size={15} /> Add Vehicle
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <div className="col-span-full text-sm text-gray-500 py-10 text-center">Loading your vehicles...</div>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full text-center py-10 border border-dashed border-gray-200 bg-gray-50/50 rounded-xl text-gray-500 text-sm">
                        No vehicle registered yet. Add one to book appointments easily!
                    </div>
                ) : (
                    vehicles.map(v => (
                        <div key={v.vehicleId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-250/50 transition-all overflow-hidden flex flex-col justify-between group relative">
                            {/* Card Image Banner */}
                            <div className="h-44 w-full relative bg-slate-50 overflow-hidden shrink-0">
                                {v.imageUrl ? (
                                    <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50/70 to-indigo-100/40 flex flex-col items-center justify-center gap-2">
                                        <Car size={36} className="text-blue-500/70" />
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600/50">No Photo Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Content Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3.5">
                                    {/* Brand & Model Header */}
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{v.brand}</p>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mt-0.5">{v.model}</h3>
                                    </div>

                                    {/* Tech Specs Panel */}
                                    <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-slate-50/70 rounded-xl border border-slate-100/50">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">License Plate</span>
                                            <span className="font-mono text-xs font-bold text-gray-700 uppercase tracking-wide block">
                                                {v.vehicleNumber}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 border-l border-gray-200/60 pl-4">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Model Year</span>
                                            <span className="text-xs font-bold text-gray-700 block">
                                                {v.year || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Aligned Actions Footer */}
                                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleOpenModal(v)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={13} />
                                        Edit Details
                                    </button>
                                    <button 
                                        onClick={() => requestDelete(v.vehicleId)}
                                        disabled={deletingId === v.vehicleId}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === v.vehicleId ? (
                                            <Loader2 size={13} className="animate-spin text-rose-500" />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>

                        {/* Vehicle Photo Upload Zone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Vehicle Photo</label>
                            
                            {form.imageUrl ? (
                                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                                    <img src={form.imageUrl} alt="Vehicle Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                        <label className="bg-white/95 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                                            Change Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                        <button 
                                            onClick={() => field('imageUrl', '')}
                                            className="bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-44 w-full border-2 border-dashed border-gray-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 rounded-xl cursor-pointer transition-all gap-2 group p-4">
                                    <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors shrink-0">
                                        <Car size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-gray-700">Upload vehicle photo</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or click to select (PNG, JPG up to 2MB)</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {[['Vehicle Number (e.g. BA-1234)', 'vehicleNumber', 'text'], ['Brand', 'brand', 'text'], ['Model', 'model', 'text'], ['Year', 'year', 'number']].map(([label, key, type]) => (
                            <div key={key} className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{label}</label>
                                <input type={type} value={form[key]} onChange={e => field(key, e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button disabled={saving} onClick={handleSave} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50 font-medium">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? 'Save Changes' : 'Add Vehicle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]" onClick={() => setConfirmDeleteId(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
                            <Trash2 size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Delete Vehicle?</h2>
                        <p className="text-sm text-gray-500">Are you sure you want to remove this vehicle? Your past appointments will still be saved.</p>
                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button disabled={deletingId !== null} onClick={handleDelete} className="flex-1 flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50 font-medium">
                                {deletingId !== null ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Vehicles