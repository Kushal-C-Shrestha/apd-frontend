import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, AlertTriangle, Briefcase, Phone, Mail, MapPin, Calendar, Receipt, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema } from '@/schemas/auth'
import { getAllVendors, createVendor, updateVendor, deleteVendor, getVendorById } from '@/services/vendorService'

const EMPTY = { name: '', contactPerson: '', phone: '', email: '', address: '' }

const Vendors = () => {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal & Sidepanel states
    const [formModal, setFormModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [selectedVendorDetail, setSelectedVendorDetail] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
        resolver: zodResolver(vendorSchema),
        defaultValues: EMPTY
    })

    const loadData = () => {
        setLoading(true)
        getAllVendors()
            .then(res => {
                setVendors(Array.isArray(res) ? res : (res?.data ?? []))
            })
            .catch(() => {
                toast.error('Failed to load vendors directory.')
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => { loadData() }, [])

    const openAdd = () => {
        reset(EMPTY)
        setFormModal('add')
    }

    const openEdit = (v, e) => {
        e.stopPropagation() // Don't open sidepanel
        reset({
            name: v.name || '',
            contactPerson: v.contactPerson || '',
            phone: v.phone || '',
            email: v.email || '',
            address: v.address || ''
        })
        setFormModal(v)
    }

    const closeFormModal = () => {
        setFormModal(null)
        reset(EMPTY)
    }

    const triggerDelete = (v, e) => {
        e.stopPropagation() // Don't open sidepanel
        setDeleteModal(v)
    }

    const handleConfirmDelete = async () => {
        if (!deleteModal) return
        setDeleting(true)
        try {
            await deleteVendor(deleteModal.vendorId)
            setVendors(p => p.filter(x => x.vendorId !== deleteModal.vendorId))
            toast.success('Vendor deleted.')
            setDeleteModal(null)
            if (selectedVendor?.vendorId === deleteModal.vendorId) {
                setSelectedVendor(null)
                setSelectedVendorDetail(null)
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete vendor. Ensure they have no associated purchases.')
        } finally {
            setDeleting(false)
        }
    }

    const handleRowClick = async (v) => {
        setSelectedVendor(v)
        setSelectedVendorDetail(null)
        setLoadingDetails(true)
        try {
            const detail = await getVendorById(v.vendorId)
            setSelectedVendorDetail(detail)
        } catch {
            toast.error("Failed to load supplier detail profile.")
        } finally {
            setLoadingDetails(false)
        }
    }

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            if (formModal === 'add') {
                const res = await createVendor(data)
                const created = res?.data ?? res
                setVendors(p => [...p, created])
                toast.success('Vendor added successfully!')
            } else {
                const res = await updateVendor(formModal.vendorId, data)
                const updated = res?.data ?? res
                setVendors(p => p.map(x => x.vendorId === formModal.vendorId ? updated : x))
                toast.success('Vendor updated successfully!')
                if (selectedVendor?.vendorId === formModal.vendorId) {
                    setSelectedVendor(updated)
                    // refresh details too
                    getVendorById(formModal.vendorId).then(setSelectedVendorDetail).catch(() => { })
                }
            }
            closeFormModal()
        } catch (e) {
            const serverErrors = e.response?.data?.errors
            if (serverErrors) {
                Object.entries(serverErrors).forEach(([field, message]) => {
                    const camelField = field.charAt(0).toLowerCase() + field.slice(1)
                    setError(camelField, { type: 'server', message: Array.isArray(message) ? message[0] : message })
                })
            } else {
                const msg = e.response?.data?.message ?? 'Failed to save vendor details.'
                const lowerMsg = msg.toLowerCase()
                if (lowerMsg.includes('email')) {
                    setError('email', { type: 'server', message: msg })
                } else if (lowerMsg.includes('phone')) {
                    setError('phone', { type: 'server', message: msg })
                } else if (lowerMsg.includes('name')) {
                    setError('name', { type: 'server', message: msg })
                } else {
                    toast.error(msg)
                }
            }
        } finally {
            setSaving(false)
        }
    }

    let purchaseHistoryList = []

    if (selectedVendorDetail) {
        if (selectedVendorDetail.purchaseHistory && selectedVendorDetail.purchaseHistory.length > 0) {
            purchaseHistoryList = selectedVendorDetail.purchaseHistory
        }
    }

    return (
        <div className="space-y-5 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Vendors Directory</h1>
                    <p className="text-sm text-gray-500">Manage supplier contacts, procurement history, and purchase records.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors">
                    <Plus size={14} /> Add Vendor
                </button>
            </div>

            {/* Vendors Table Layout */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 bg-gray-50/50 border-b border-gray-150">
                            {['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', ''].map((h, i) => (
                                <th key={i} className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-20 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-400">
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        Loading supplier directory...
                                    </div>
                                </td>
                            </tr>
                        ) : vendors.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-20 text-center text-gray-400">
                                    No suppliers registered. Click "Add Vendor" to start.
                                </td>
                            </tr>
                        ) : vendors.map(v => (
                            <tr
                                key={v.vendorId}
                                onClick={() => handleRowClick(v)}
                                className="border-b border-gray-50 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                            >
                                <td className="px-5 py-3.5 font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{v.name}</td>
                                <td className="px-5 py-3.5 text-gray-500">{v.contactPerson || '�'}</td>
                                <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{v.email}</td>
                                <td className="px-5 py-3.5 text-gray-500">{v.phone}</td>
                                <td className="px-5 py-3.5 text-gray-400 truncate max-w-[150px]">{v.address || '�'}</td>
                                <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-2 justify-end">
                                        <button onClick={(e) => openEdit(v, e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Vendor"><Pencil size={13} /></button>
                                        <button onClick={(e) => triggerDelete(v, e)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete Vendor"><Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FORM MODAL (Add/Edit) */}
            {formModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={closeFormModal}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">{formModal === 'add' ? 'Add Vendor Account' : 'Edit Vendor Account'}</h2>
                                <p className="text-[11px] text-gray-500">Provide verified distributor registry details.</p>
                            </div>
                            <button type="button" onClick={closeFormModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                ['Company Name *', 'name', 'text', 'e.g. AutoParts Distributor Ltd.'],
                                ['Contact Person', 'contactPerson', 'text', 'e.g. John Doe'],
                                ['Email Address *', 'email', 'email', 'e.g. orders@distributor.com'],
                                ['Phone Number *', 'phone', 'tel', 'e.g. +1 555-0199'],
                                ['Address', 'address', 'text', 'e.g. 52nd Industrial Boulevard']
                            ].map(([label, key, type, placeholder]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        {...register(key)}
                                        className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 transition-all bg-slate-50/30 focus:bg-white ${errors[key]
                                                ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                                            }`}
                                    />
                                    {errors[key] && (
                                        <p className="text-[10px] text-rose-500 font-medium">{errors[key].message}</p>
                                    )}
                                </div>
                            ))}

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeFormModal} className="flex-1 border border-gray-200 text-gray-600 text-xs py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                                    {saving && <Loader2 size={13} className="animate-spin" />} Save Supplier
                                </button>
                            </div>
                        </div>
                    </form>
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
                                <h3 className="text-sm font-bold text-gray-900">Delete Distributor?</h3>
                                <p className="text-xs text-gray-500 px-2 leading-relaxed">
                                    Are you sure you want to permanently remove <strong className="text-gray-700">{deleteModal.name}</strong>? This action cannot be undone and will fail if they have associated procurement history.
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

            {/* BEAUTIFUL SIDEPANEL DETAIL OVERLAY */}
            {selectedVendor && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40" onClick={() => { setSelectedVendor(null); setSelectedVendorDetail(null); }}>
                    <div
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-50 shadow-2xl border-l border-gray-100 flex flex-col z-50 animate-in slide-in-from-right duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-gray-150 flex items-center justify-between shrink-0 shadow-2xs">
                            <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] uppercase font-bold tracking-wider">Distributor profile</span>
                                <h2 className="text-base font-extrabold text-gray-800 leading-tight">{selectedVendor.name}</h2>
                            </div>
                            <button
                                onClick={() => { setSelectedVendor(null); setSelectedVendorDetail(null); }}
                                className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Sidepanel Contents */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                            {/* Profile Details Card */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4 shadow-3xs bg-radial">
                                <h3 className="text-xs font-bold text-gray-800 border-b border-gray-50 pb-2">Supplier Profile</h3>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Briefcase className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Contact Person</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-1">{selectedVendor.contactPerson || '�'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Phone Number</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-1">{selectedVendor.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Email Address</p>
                                            <p className="text-xs font-mono text-gray-700 mt-1">{selectedVendor.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Business Address</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-1 leading-relaxed">{selectedVendor.address || '�'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 border-t border-gray-50 pt-3">
                                        <Calendar className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Registry Date</p>
                                            <p className="text-xs font-semibold text-gray-600 mt-1">
                                                {new Date(selectedVendor.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase History Card list */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <Receipt size={14} className="text-blue-500" />
                                        Purchase History
                                    </h3>
                                    {selectedVendorDetail && (
                                        <span className="bg-slate-200/80 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {selectedVendorDetail.purchaseHistory?.length || 0} Invoices
                                        </span>
                                    )}
                                </div>

                                {loadingDetails ? (
                                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        Retrieving purchase history...
                                    </div>
                                ) : purchaseHistoryList.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-xs text-gray-400">
                                        No purchase orders recorded for this supplier.
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        {purchaseHistoryList.map(p => (
                                            <div key={p.purchaseId} className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs space-y-3 hover:border-gray-200 transition-colors">
                                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                                    <div>
                                                        <p className="text-[10px] font-mono font-bold text-blue-600">INVOICE #{p.purchaseId}</p>
                                                        <p className="text-[9px] text-gray-400">{new Date(p.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}</p>
                                                    </div>
                                                    <span className="text-xs font-extrabold text-slate-800">
                                                        Rs. {p.totalAmount.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Parts details inside invoice */}
                                                <div className="space-y-2">
                                                    {p.items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-[11px] text-gray-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <ChevronRight size={10} className="text-gray-400" />
                                                                <span>{item.partName}</span>
                                                            </div>
                                                            <span className="font-semibold text-gray-800">
                                                                {item.quantity} � Rs.{item.unitCost}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Vendors