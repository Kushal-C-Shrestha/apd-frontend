import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, AlertTriangle, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllParts, createPart, updatePart, deletePart } from '@/services/partService'

const EMPTY = { name: '', description: '', costPrice: '', unitPrice: '', stockQuantity: '', imageUrl: '' }

const Parts = () => {
    const [parts, setParts] = useState([])
    const [loading, setLoading] = useState(true)

    const [modal, setModal] = useState(null) // 'add' | {partId...}
    const [deleteModal, setDeleteModal] = useState(null) // null | partToConfirm

    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        getAllParts()
            .then(res => setParts(Array.isArray(res) ? res : (res?.data ?? [])))
            .catch(() => toast.error('Failed to load parts.'))
            .finally(() => setLoading(false))
    }, [])

    const field = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const openAdd = () => { setForm(EMPTY); setModal('add') }
    const openEdit = (p) => {
        setForm({
            ...p,
            costPrice: String(p.costPrice || 0),
            unitPrice: String(p.unitPrice),
            stockQuantity: String(p.stockQuantity),
            imageUrl: p.imageUrl || ''
        })
        setModal(p)
    }
    const close = () => { setModal(null); setForm(EMPTY) }

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

    const handleSave = async () => {
        if (!form.name || !form.costPrice || !form.unitPrice) return
        setSaving(true)
        const payload = {
            name: form.name.trim(),
            description: form.description || '',
            costPrice: Number(form.costPrice),
            unitPrice: Number(form.unitPrice),
            stockQuantity: Number(form.stockQuantity),
            imageUrl: form.imageUrl || null
        }
        try {
            if (modal === 'add') {
                const created = await createPart(payload)
                setParts(p => [...p, created?.data ?? created])
                toast.success('Part added successfully.')
            } else {
                const updated = await updatePart(modal.partId, payload)
                setParts(p => p.map(x => x.partId === modal.partId ? (updated?.data ?? updated) : x))
                toast.success('Part updated successfully.')
            }
            close()
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to save part.')
        } finally {
            setSaving(false)
        }
    }

    const triggerDelete = (p) => {
        setDeleteModal(p)
    }

    const handleConfirmDelete = async () => {
        if (!deleteModal) return
        setDeleting(true)
        try {
            await deletePart(deleteModal.partId)
            setParts(p => p.filter(x => x.partId !== deleteModal.partId))
            toast.success('Part deleted successfully.')
            setDeleteModal(null)
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to delete part. It may be used in historical sales or purchases.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Inventory Parts</h1>
                    <p className="text-sm text-gray-500">Manage store inventory, cost pricing, and sales configurations.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors">
                    <Plus size={14} /> Add Part
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 bg-gray-50/50 border-b border-gray-150">
                            {['Name', 'Description', 'Cost Price', 'Selling Price', 'Stock', ''].map((h, i) => (
                                <th key={i} className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-5 py-20 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400"><Loader2 size={16} className="animate-spin text-blue-500" /> Loading inventory...</div>
                            </td></tr>
                        ) : parts.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-20 text-center text-gray-400">No parts found. Click "Add Part" to begin.</td></tr>
                        ) : parts.map(p => (
                            <tr key={p.partId} className="border-b border-gray-50 hover:bg-slate-50/60 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-gray-800">
                                    <div className="flex items-center gap-3">
                                        {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-150 shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-50 border border-gray-100 flex items-center justify-center rounded-lg text-slate-400 shrink-0">
                                                <Package size={16} />
                                            </div>
                                        )}
                                        <span>{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-gray-500 text-xs truncate max-w-[200px]">{p.description || '�'}</td>
                                <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">Rs. {Number(p.costPrice || 0).toLocaleString()}</td>
                                <td className="px-5 py-3.5 text-gray-800 font-bold font-mono text-xs">Rs. {Number(p.unitPrice).toLocaleString()}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${p.stockQuantity < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {p.stockQuantity}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil size={13} /></button>
                                        <button onClick={() => triggerDelete(p)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FORM MODAL (Add/Edit) */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={close}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">{modal === 'add' ? 'Add Inventory Part' : 'Edit Inventory Part'}</h2>
                                <p className="text-[11px] text-gray-500">Update stock parameters and pricing.</p>
                            </div>
                            <button onClick={close} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Part Image Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Part Photo</label>
                                {form.imageUrl ? (
                                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                                        <img src={form.imageUrl} alt="Part Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <label className="bg-white/95 hover:bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs uppercase">
                                                Change Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => field('imageUrl', '')}
                                                className="bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs uppercase"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 rounded-xl cursor-pointer transition-all gap-1.5 group p-4">
                                        <div className="w-8 h-8 bg-white shadow-xs rounded-lg flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors shrink-0">
                                            <Package size={16} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-bold text-gray-700">Upload part photo</p>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Click to select (PNG, JPG up to 2MB)</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>

                            {[['Part Name *', 'name', 'text'], ['Description', 'description', 'text']].map(([label, key, type]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
                                    <input type={type} value={form[key] ?? ''} onChange={e => field(key, e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30 focus:bg-white transition-all" />
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cost Price (Rs.) *</label>
                                    <input type="number" min="0" step="0.01" value={form.costPrice ?? ''} onChange={e => field('costPrice', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30 focus:bg-white transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Selling Price (Rs.) *</label>
                                    <input type="number" min="0" step="0.01" value={form.unitPrice ?? ''} onChange={e => field('unitPrice', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Initial Stock Quantity *</label>
                                <input type="number" min="0" step="1" value={form.stockQuantity ?? ''} onChange={e => field('stockQuantity', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30 focus:bg-white transition-all" />
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button onClick={close} className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 size={13} className="animate-spin" /> : 'Save Part'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setDeleteModal(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-sm font-bold text-gray-900">Delete Part?</h3>
                                <p className="text-xs text-gray-500 px-2 leading-relaxed">
                                    Are you sure you want to remove <strong className="text-gray-700">{deleteModal.name}</strong> from the inventory? This action is permanent and cannot be reversed.
                                </p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setDeleteModal(null)} className="flex-1 border border-gray-200 text-gray-600 text-xs py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                                <button type="button" onClick={handleConfirmDelete} disabled={deleting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-2.5 rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors">
                                    {deleting ? <Loader2 size={13} className="animate-spin" /> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Parts