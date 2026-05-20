import { useEffect, useState } from 'react'
import { Building2, Loader2, Plus, ShoppingCart, Trash2, X, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllPurchases, createPurchase, getAllParts } from '@/services/partService'
import { getAllVendors } from '@/services/vendorService'

const STATUS = {
    Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
    Credit: 'bg-rose-50 text-rose-700 border border-rose-100/50',
    Partial: 'bg-amber-50 text-amber-700 border border-amber-100/50',
}

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'

const emptyRow = () => ({ isNew: false, partId: '', partName: '', quantity: '1', unitCost: '', unitPrice: '' })

const Purchases = () => {
    const [purchases, setPurchases] = useState([])
    const [vendors, setVendors] = useState([])
    const [parts, setParts] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')

    const [vendorId, setVendorId] = useState('')
    const [paymentStatus, setPaymentStatus] = useState('Paid')
    const [rows, setRows] = useState([emptyRow()])

    const handleSelectPurchase = (p) => {
        setSelectedPurchase(p)
        setActiveTab('overview')
    }

    useEffect(() => {
        Promise.all([getAllPurchases(), getAllVendors(), getAllParts()])
            .then(([p, v, pts]) => {
                setPurchases(Array.isArray(p) ? p : (p?.data ?? []))
                setVendors(Array.isArray(v) ? v : (v?.data ?? []))
                setParts(Array.isArray(pts) ? pts : (pts?.data ?? []))
            })
            .catch(() => toast.error('Failed to load data.'))
            .finally(() => setLoading(false))
    }, [])

    const openModal = () => { setVendorId(''); setPaymentStatus('Paid'); setRows([emptyRow()]); setModalOpen(true) }
    const closeModal = () => setModalOpen(false)

    const updateRow = (i, field, value) => {
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
    }

    const handleSave = async () => {
        if (!vendorId || rows.some(r => r.isNew ? (!r.partName || !r.unitCost || !r.unitPrice) : (!r.partId || !r.unitCost))) {
            toast.error('Please fill all required fields for each item.')
            return
        }
        setSaving(true)
        try {
            const payload = {
                vendorId: Number(vendorId),
                paymentStatus,
                items: rows.map(r => ({
                    partId: r.isNew ? null : Number(r.partId),
                    partName: r.isNew ? r.partName : undefined,
                    quantity: Math.max(1, parseInt(r.quantity) || 1),
                    unitCost: Number(r.unitCost),
                    unitPrice: r.isNew ? Number(r.unitPrice) : undefined
                }))
            }
            const created = await createPurchase(payload)
            setPurchases(p => [created?.data ?? created, ...p])
            // Refresh parts list so the new part appears in future dropdowns
            getAllParts().then(pts => setParts(Array.isArray(pts) ? pts : (pts?.data ?? [])))
            toast.success('Purchase recorded.')
            closeModal()
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Failed to save.')
        } finally {
            setSaving(false)
        }
    }

    const summarise = (items = []) => {
        if (!items.length) return '—'
        const first = items[0]?.partName ?? items[0]?.part?.name ?? 'Part'
        return items.length === 1 ? first : `${first} +${items.length - 1} more`
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ShoppingCart size={18} /></div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Purchases</h1>
                        <p className="text-sm text-gray-500">Inventory purchases from vendors.</p>
                    </div>
                </div>
                <button onClick={openModal} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Plus size={15} /> Add Purchase
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400">
                            {['Date', 'Vendor', 'Items', 'Total', 'Status'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-5 py-12 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
                            </td></tr>
                        ) : purchases.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No purchases yet.</td></tr>
                        ) : purchases.map(p => (
                            <tr key={p.purchaseId ?? p.id} onClick={() => handleSelectPurchase(p)} className="border-b border-gray-50 hover:bg-blue-50/10 transition-colors last:border-b-0 cursor-pointer">
                                <td className="px-5 py-4 text-gray-500">{fmt(p.createdAt ?? p.purchaseDate)}</td>
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-gray-800">
                                        {p.vendorName ?? p.vendor?.name ?? '—'}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-gray-600 font-medium">{summarise(p.items ?? p.purchaseItems)}</td>
                                <td className="px-5 py-4 font-bold text-gray-900">
                                    Rs. {Number(p.totalAmount ?? 0).toLocaleString()}
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${STATUS[p.paymentStatus] || 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
                                        {p.paymentStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedPurchase && (
                <div
                    className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex justify-end"
                    onClick={() => setSelectedPurchase(null)}
                >
                    <div
                        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                    {(selectedPurchase.vendorName ?? selectedPurchase.vendor?.name ?? 'V').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-gray-900 leading-none">
                                        {selectedPurchase.vendorName ?? selectedPurchase.vendor?.name ?? 'Unknown Vendor'}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 leading-none font-medium">Purchase Order #{selectedPurchase.purchaseId}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPurchase(null)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Contact info list */}
                        {(() => {
                            const v = vendors.find(v => v.vendorId === (selectedPurchase.vendorId ?? selectedPurchase.vendor?.vendorId)) || selectedPurchase.vendor;
                            return v ? (
                                <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 shrink-0 bg-white">
                                    {v.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={12} className="text-gray-400" />
                                            <span>{v.email}</span>
                                        </div>
                                    )}
                                    {v.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={12} className="text-gray-400" />
                                            <span>{v.phone}</span>
                                        </div>
                                    )}
                                    {v.address && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-gray-400" />
                                            <span className="truncate max-w-[200px]">{v.address}</span>
                                        </div>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        {/* Tabs Navigation */}
                        <div className="px-5 border-b border-gray-100 flex gap-4 shrink-0 bg-white">
                            {[
                                { id: 'overview', label: 'Order Info', icon: ShoppingCart },
                                { id: 'items', label: 'Purchase Items', icon: Building2 }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all relative ${isActive
                                                ? 'border-blue-600 text-blue-600 font-bold'
                                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tabs Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50/30 space-y-4">
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchase Overview</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Amount</span>
                                                <div className="text-lg font-bold text-gray-900">
                                                    Rs. {Number(selectedPurchase.totalAmount ?? 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Payment Status</span>
                                                <div>
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${STATUS[selectedPurchase.paymentStatus] || 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
                                                        {selectedPurchase.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Info</h4>
                                        <div className="space-y-2 text-xs font-medium">
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Order ID:</span>
                                                <span className="text-gray-800">#{selectedPurchase.purchaseId}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Date Logged:</span>
                                                <span className="text-gray-800">{fmt(selectedPurchase.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-400 uppercase text-[10px]">Unique Items:</span>
                                                <span className="text-gray-800">
                                                    {(selectedPurchase.items ?? selectedPurchase.purchaseItems ?? []).length} items
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'items' && (
                                <div className="space-y-3">
                                    {(selectedPurchase.items ?? selectedPurchase.purchaseItems ?? []).map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-800 truncate">{item.partName ?? item.part?.name ?? 'Unknown Part'}</h4>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                    <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                                                    <span>•</span>
                                                    <span>Unit Cost: <strong className="text-gray-700 font-medium">Rs. {Number(item.unitCost).toLocaleString()}</strong></span>
                                                </div>
                                            </div>
                                            <span className="shrink-0 font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-xl">
                                                Rs. {Number(item.quantity * item.unitCost).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={closeModal}>
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Add Purchase</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Vendor</label>
                                <select value={vendorId} onChange={e => setVendorId(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select vendor...</option>
                                    {vendors.map(v => <option key={v.vendorId} value={v.vendorId}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Payment Status</label>
                                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {Object.keys(STATUS).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">Items</h3>
                                <button onClick={() => setRows(p => [...p, emptyRow()])}
                                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>
                            {rows.map((row, i) => (
                                <div key={i} className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 md:grid-cols-12 items-start">
                                    <div className="md:col-span-12 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={row.isNew} onChange={e => updateRow(i, 'isNew', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            Add New Part
                                        </label>
                                        <button onClick={() => setRows(p => p.length === 1 ? p : p.filter((_, idx) => idx !== i))}
                                            disabled={rows.length === 1}
                                            className="text-gray-400 hover:text-rose-600 disabled:opacity-40 transition-colors">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <div className={`space-y-1 ${row.isNew ? 'md:col-span-12' : 'md:col-span-5'}`}>
                                        <label className="text-xs text-gray-500">Part</label>
                                        {row.isNew ? (
                                            <input type="text" placeholder="New part name..." value={row.partName} onChange={e => updateRow(i, 'partName', e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        ) : (
                                            <select value={row.partId} onChange={e => updateRow(i, 'partId', e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">Select part...</option>
                                                {parts.map(p => <option key={p.partId} value={p.partId}>{p.name} (Rs. {Number(p.unitPrice).toLocaleString()})</option>)}
                                            </select>
                                        )}
                                    </div>

                                    <div className={`space-y-1 ${row.isNew ? 'md:col-span-4' : 'md:col-span-3'}`}>
                                        <label className="text-xs text-gray-500">CP (Cost/unit)</label>
                                        <input type="number" min={0} step="0.01" placeholder="Rs." value={row.unitCost} onChange={e => updateRow(i, 'unitCost', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    {row.isNew && (
                                        <div className="space-y-1 md:col-span-4">
                                            <label className="text-xs text-gray-500">SP (Sell Price)</label>
                                            <input type="number" min={0} step="0.01" placeholder="Rs." value={row.unitPrice} onChange={e => updateRow(i, 'unitPrice', e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    )}

                                    <div className={`space-y-1 ${row.isNew ? 'md:col-span-4' : 'md:col-span-4'}`}>
                                        <label className="text-xs text-gray-500">Qty</label>
                                        <input type="number" min={1} value={row.quantity} onChange={e => updateRow(i, 'quantity', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={closeModal} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Purchases