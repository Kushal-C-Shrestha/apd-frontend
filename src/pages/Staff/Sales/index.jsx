import { Fragment, useEffect, useState } from 'react'
import {
    ChevronDown,
    ChevronUp,
    Eye,
    LoaderCircle,
    Mail,
    Package,
    Percent,
    Plus,
    Trash2,
    X,
    Phone,
    MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createSale, getAllSales, getCustomerHistory, getCustomers, sendInvoiceEmail } from '@/services/saleService'
import { getAllParts } from '@/services/partService'

const AUTO_DISCOUNT_THRESHOLD = 5000
const AUTO_DISCOUNT_RATE = 0.1
const PAYMENT_OPTIONS = ['Full', 'Partial', 'Credit']

const emptyRow = () => ({ partId: '', quantity: '1' })

const money = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 2,
})

const dateTime = new Intl.DateTimeFormat('en-NP', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
})

const toNumber = (value) => Number(value ?? 0)

const formatMoney = (value) => money.format(toNumber(value))

const formatDate = (value) => {
    if (!value) return '-'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? '-' : dateTime.format(parsed)
}

const normalizeSale = (sale) => {
    const totalAmount = toNumber(sale?.totalAmount ?? sale?.TotalAmount)
    const discount = toNumber(sale?.discount ?? sale?.Discount)
    const finalAmount = toNumber(sale?.finalAmount ?? sale?.FinalAmount)
    const amountPaid = toNumber(sale?.amountPaid ?? sale?.AmountPaid)

    return {
        saleId: sale?.saleId ?? sale?.SaleId,
        customerName: sale?.userName ?? sale?.UserName ?? sale?.customerName ?? sale?.CustomerName ?? 'Walk-in Client',
        totalAmount,
        discount,
        finalAmount,
        amountPaid,
        creditAmount: toNumber(sale?.credit?.amountDue ?? sale?.Credit?.AmountDue ?? Math.max(0, finalAmount - amountPaid)),
        paymentStatus: sale?.paymentStatus ?? sale?.PaymentStatus ?? 'Unpaid',
        createdAt: sale?.createdAt ?? sale?.CreatedAt,
        items: (sale?.items ?? sale?.Items ?? []).map(item => ({
            saleItemId: item?.saleItemId ?? item?.SaleItemId,
            partId: item?.partId ?? item?.PartId,
            partName: item?.partName ?? item?.PartName,
            quantity: item?.quantity ?? item?.Quantity,
            unitPrice: toNumber(item?.unitPrice ?? item?.UnitPrice),
            subtotal: toNumber(item?.subtotal ?? item?.Subtotal)
        }))
    }
}

const summarizeItems = (items) => {
    if (!items?.length) return 'No parts'

    const visible = items.slice(0, 2).map((item) => `${item.partName} x${item.quantity}`)
    const extra = items.length - visible.length
    return extra > 0 ? `${visible.join(', ')} +${extra} more` : visible.join(', ')
}

const statusClassName = (status) => {
    const key = status?.toLowerCase()

    if (key === 'paid') return 'bg-emerald-50 text-emerald-700'
    if (key === 'partial') return 'bg-amber-50 text-amber-700'
    return 'bg-rose-50 text-rose-700'
}

const SaleDetails = ({ sale }) => (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Parts list */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Items / Parts</h3>
            {sale.items.length === 0 ? (
                <p className="text-sm text-slate-500">No part details available.</p>
            ) : (
                <div className="space-y-3">
                    {sale.items.map((item, index) => (
                        <div
                            key={item.saleItemId ?? `${sale.saleId}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
                        >
                            <div>
                                <p className="font-semibold text-slate-800">{item.partName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Qty {item.quantity} × {formatMoney(item.unitPrice)}</p>
                            </div>
                            <span className="font-semibold text-slate-900">{formatMoney(item.subtotal)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Summary Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Sale Summary</h3>
                <div className="divide-y divide-slate-100 text-sm">
                    <div className="flex justify-between py-3">
                        <span className="text-slate-500">Customer</span>
                        <span className="font-semibold text-slate-800">{sale.customerName}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-slate-500">Status</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClassName(sale.paymentStatus)}`}>
                            {sale.paymentStatus}
                        </span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-slate-500">Date</span>
                        <span className="text-slate-700">{formatDate(sale.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-800">{formatMoney(sale.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-semibold text-slate-800">- {formatMoney(sale.discount)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-dashed border-slate-200 mt-1 pt-4">
                        <span className="font-bold text-slate-900">Final Total</span>
                        <span className="font-bold text-lg text-slate-900">{formatMoney(sale.finalAmount)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between text-sm">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Details</p>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <p className="text-xs text-slate-500">Paid</p>
                            <p className="font-semibold text-emerald-600">{formatMoney(sale.amountPaid)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Due</p>
                            <p className={`font-semibold ${sale.creditAmount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {formatMoney(sale.creditAmount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const Sales = () => {
    const [sales, setSales] = useState([])
    const [customers, setCustomers] = useState([])
    const [parts, setParts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(false)
    const [previewSale, setPreviewSale] = useState(null)
    const [expandedSaleId, setExpandedSaleId] = useState(null)
    const [saleActiveTab, setSaleActiveTab] = useState('overview')

    const handleSelectSale = (sale) => {
        setPreviewSale(sale)
        setSaleActiveTab('overview')
    }

    const [selectedCustomerId, setSelectedCustomerId] = useState('')
    const [rows, setRows] = useState([emptyRow()])
    const [paymentType, setPaymentType] = useState('Full')
    const [amountPaidInput, setAmountPaidInput] = useState('')

    useEffect(() => {
        let active = true

        Promise.all([getAllSales(), getCustomers(), getAllParts()])
            .then(([salesResponse, customerResponse, partResponse]) => {
                if (!active) return
                const loadedSales = (salesResponse ?? []).map(normalizeSale)
                setSales(loadedSales)
                setCustomers(customerResponse ?? [])
                setParts(partResponse ?? [])
            })
            .catch(() => {
                if (active) {
                    showToast('Failed to load sales data.', 'error')
                    setSales([])
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const showToast = (message, type = 'success') => {
        const options = {
            position: 'top-center',
            style: {
                background: '#fff',
                color: '#1e293b',
            },
        }

        if (type === 'error') {
            toast.error(message, options)
            return
        }

        toast.success(message, options)
    }

    const openModal = () => {
        setSelectedCustomerId('')
        setRows([emptyRow()])
        setPaymentType('Full')
        setAmountPaidInput('')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        if (!submitting) setIsModalOpen(false)
    }

    const updateRow = (index, field, value) => {
        setRows((current) => current.map((row, rowIndex) => (
            rowIndex === index ? { ...row, [field]: value } : row
        )))
    }

    const addRow = () => setRows((current) => [...current, emptyRow()])

    const removeRow = (index) => {
        setRows((current) => current.length === 1
            ? current
            : current.filter((_, rowIndex) => rowIndex !== index))
    }

    const toggleExpanded = (saleId) => {
        setExpandedSaleId((current) => current === saleId ? null : saleId)
    }

    const detailedRows = rows.map((row) => {
        const part = parts.find((item) => item.partId === Number(row.partId))
        const quantity = Math.max(1, parseInt(row.quantity, 10) || 1)
        const unitPrice = toNumber(part?.unitPrice)

        return {
            ...row,
            quantity,
            part,
            unitPrice,
            subtotal: unitPrice * quantity,
            stockQuantity: part?.stockQuantity ?? 0,
        }
    })

    const subtotal = detailedRows.reduce((total, row) => total + row.subtotal, 0)
    const autoDiscount = subtotal > AUTO_DISCOUNT_THRESHOLD ? subtotal * AUTO_DISCOUNT_RATE : 0
    const finalAmount = Math.max(0, subtotal - autoDiscount)
    const partialAmount = Math.max(0, toNumber(amountPaidInput))
    const amountPaid = paymentType === 'Full'
        ? finalAmount
        : paymentType === 'Credit'
            ? 0
            : Math.min(partialAmount, finalAmount)
    const amountDue = Math.max(0, finalAmount - amountPaid)
    const thresholdReachedWithoutDiscount = subtotal >= AUTO_DISCOUNT_THRESHOLD && autoDiscount === 0

    const selectedCustomer = customers.find((customer) => customer.userId === Number(selectedCustomerId))

    const handleSubmit = async () => {
        if (!selectedCustomerId) {
            showToast('Select a customer before creating the sale.', 'error')
            return
        }

        if (!detailedRows.length || detailedRows.some((row) => !row.partId)) {
            showToast('Choose at least one part.', 'error')
            return
        }

        if (detailedRows.some((row) => row.quantity > row.stockQuantity)) {
            showToast('One or more items exceed available stock.', 'error')
            return
        }

        if (paymentType === 'Partial' && (amountPaid <= 0 || amountPaid >= finalAmount)) {
            showToast('Partial payment must be more than 0 and less than the final total.', 'error')
            return
        }

        setSubmitting(true)

        try {
            const created = await createSale({
                userId: Number(selectedCustomerId),
                items: detailedRows.map((row) => ({
                    partId: Number(row.partId),
                    quantity: row.quantity,
                })),
                discount: 0,
                amountPaid,
            })

            setSales((current) => [normalizeSale(created), ...current])
            setParts((current) => current.map((part) => {
                const soldRow = detailedRows.find((row) => row.part?.partId === part.partId)
                return soldRow
                    ? { ...part, stockQuantity: Math.max(0, toNumber(part.stockQuantity) - soldRow.quantity) }
                    : part
            }))

            showToast(`Sale created for ${selectedCustomer?.fullName ?? 'the customer'}.`)
            setIsModalOpen(false)
        } catch (error) {
            showToast(error?.response?.data?.message ?? 'Failed to create sale.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendInvoice = async () => {
        if (!previewSale) return
        setSendingEmail(true)
        try {
            await sendInvoiceEmail(previewSale.saleId)
            showToast('Invoice email sent successfully.')
        } catch (error) {
            showToast(error?.response?.data?.message ?? 'Failed to send invoice email.', 'error')
        } finally {
            setSendingEmail(false)
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Sales</h1>
                </div>

                <button
                    type="button"
                    onClick={openModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    <Plus size={16} />
                    Create Sale
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Customer</th>
                                <th className="px-5 py-3 font-medium">Parts</th>
                                <th className="px-5 py-3 font-medium">Final</th>
                                <th className="px-5 py-3 font-medium">Paid</th>
                                <th className="px-5 py-3 font-medium">Due</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Loading sales...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && sales.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                        No sales yet.
                                    </td>
                                </tr>
                            )}

                            {!loading && sales.map((sale) => (
                                <tr
                                    key={sale.saleId}
                                    onClick={() => handleSelectSale(sale)}
                                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-slate-900">{sale.customerName}</div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{summarizeItems(sale.items)}</td>
                                    <td className="px-5 py-4 font-medium text-slate-900">{formatMoney(sale.finalAmount)}</td>
                                    <td className="px-5 py-4 text-slate-700">{formatMoney(sale.amountPaid)}</td>
                                    <td className="px-5 py-4 text-slate-700">{formatMoney(sale.creditAmount)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(sale.paymentStatus)}`}>
                                            {sale.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{formatDate(sale.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Create Sale</h2>
                                <p className="mt-1 text-sm text-slate-500">Select a customer, vehicle, parts, and payment.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.45fr_0.8fr]">
                            <div className="space-y-6">
                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm text-slate-600">Customer</span>
                                            <select
                                                value={selectedCustomerId}
                                                onChange={(event) => setSelectedCustomerId(event.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                            >
                                                <option value="">Select customer</option>
                                                {customers.map((customer) => (
                                                    <option key={customer.userId} value={customer.userId}>
                                                        {customer.fullName} — {customer.email}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        {selectedCustomer && (
                                            <div className="text-sm text-slate-600 mt-3">
                                                <p className="font-medium text-slate-900">{selectedCustomer.fullName}</p>
                                                <p className="mt-1">{selectedCustomer.phone || selectedCustomer.email}</p>
                                            </div>
                                        )}
                                    </div>

                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900">Parts</h3>

                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                        <div className="divide-y divide-slate-200">
                                            {detailedRows.map((row, index) => (
                                                <div key={`${index}-${row.partId}`} className="px-3 py-3">
                                                    <div className="grid gap-3 md:grid-cols-[1.7fr_0.6fr_0.9fr_auto] md:items-end">
                                                        <label className="space-y-2">
                                                            <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Part</span>
                                                            <select
                                                                value={row.partId}
                                                                onChange={(event) => updateRow(index, 'partId', event.target.value)}
                                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                                            >
                                                                <option value="">Select part</option>
                                                                {parts.map((part) => (
                                                                    <option
                                                                        key={part.partId}
                                                                        value={part.partId}
                                                                        disabled={toNumber(part.stockQuantity) <= 0}
                                                                    >
                                                                        {part.name} - {formatMoney(part.unitPrice)} ({part.stockQuantity} left)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <label className="space-y-2">
                                                            <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Qty</span>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={rows[index].quantity}
                                                                onChange={(event) => updateRow(index, 'quantity', event.target.value)}
                                                                onBlur={(event) => updateRow(index, 'quantity', String(Math.max(1, parseInt(event.target.value, 10) || 1)))}
                                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                                            />
                                                        </label>

                                                        <div className="space-y-2">
                                                            <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Subtotal</span>
                                                            <div className="px-1 py-2.5 text-sm font-medium text-slate-900">{formatMoney(row.subtotal)}</div>
                                                        </div>

                                                        <div className="flex items-end justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRow(index)}
                                                                disabled={rows.length === 1}
                                                                className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 disabled:text-slate-300"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {row.part && row.quantity > row.stockQuantity && (
                                                        <p className="mt-3 text-sm text-rose-600">
                                                            Only {row.stockQuantity} unit(s) are available for {row.part.name}.
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-200 px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={addRow}
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                <Plus size={15} />
                                                Add Part
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Package size={16} />
                                    Payment & Summary
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {PAYMENT_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setPaymentType(option)}
                                            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                                paymentType === option
                                                    ? 'bg-slate-900 text-white'
                                                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                {paymentType === 'Partial' && (
                                    <label className="mt-4 block space-y-2">
                                        <span className="text-sm text-slate-600">Amount paid now</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={amountPaidInput}
                                            onChange={(event) => setAmountPaidInput(event.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        />
                                    </label>
                                )}

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-slate-900">{formatMoney(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Discount</span>
                                        <span className="font-medium text-slate-900">- {formatMoney(autoDiscount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Paid now</span>
                                        <span className="font-medium text-slate-900">{formatMoney(amountPaid)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Due</span>
                                        <span className="font-medium text-slate-900">{formatMoney(amountDue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                        <span className="font-medium text-slate-900">Final total</span>
                                        <span className="font-semibold text-slate-900">{formatMoney(finalAmount)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-slate-600">
                                    <div className="flex items-start gap-2">
                                        <Percent size={15} className="mt-0.5 text-slate-500" />
                                        <span>
                                            {autoDiscount > 0
                                                ? '10% discount applied because the subtotal is above Rs. 5,000.'
                                                : thresholdReachedWithoutDiscount
                                                    ? 'Add any amount above Rs. 5,000 to apply the 10% discount.'
                                                    : 'The 10% discount applies once the subtotal goes above Rs. 5,000.'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
                            >
                                {submitting && <LoaderCircle size={16} className="animate-spin" />}
                                {submitting ? 'Saving...' : 'Save Sale'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewSale && (
                <div 
                    className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex justify-end"
                    onClick={() => setPreviewSale(null)}
                >
                    <div 
                        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                    {(previewSale.customerName ?? 'C').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-gray-900 leading-none">
                                        {previewSale.customerName}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 leading-none font-medium">Sale Details #{previewSale.saleId}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleSendInvoice}
                                    disabled={sendingEmail}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                >
                                    {sendingEmail ? <LoaderCircle size={13} className="animate-spin" /> : <Mail size={13} />}
                                    Send Invoice
                                </button>
                                <button 
                                    onClick={() => setPreviewSale(null)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Customer contact info block if found */}
                        {(() => {
                            const c = customers.find(cust => cust.fullName === previewSale.customerName || cust.userId === previewSale.userId);
                            return c ? (
                                <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 shrink-0 bg-white">
                                    {c.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={12} className="text-gray-400" />
                                            <span>{c.email}</span>
                                        </div>
                                    )}
                                    {c.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={12} className="text-gray-400" />
                                            <span>{c.phone}</span>
                                        </div>
                                    )}
                                    {c.address && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-gray-400" />
                                            <span className="truncate max-w-[200px]">{c.address}</span>
                                        </div>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        {/* Tabs Navigation */}
                        <div className="px-5 border-b border-gray-100 flex gap-4 shrink-0 bg-white">
                            {[
                                { id: 'overview', label: 'Sale Summary', icon: Package },
                                { id: 'items', label: 'Sold Items', icon: Eye }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = saleActiveTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSaleActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all relative ${
                                            isActive 
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
                            {saleActiveTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Overview</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Final Total</span>
                                                <div className="text-lg font-bold text-gray-900">
                                                    {formatMoney(previewSale.finalAmount)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Payment Status</span>
                                                <div>
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${statusClassName(previewSale.paymentStatus)}`}>
                                                        {previewSale.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sale Summary</h4>
                                        <div className="space-y-2.5 text-xs font-medium">
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Customer:</span>
                                                <span className="text-gray-800">{previewSale.customerName}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Date Logged:</span>
                                                <span className="text-gray-800">{formatDate(previewSale.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Subtotal:</span>
                                                <span className="text-gray-800">{formatMoney(previewSale.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-50">
                                                <span className="text-gray-400 uppercase text-[10px]">Discount:</span>
                                                <span className="text-gray-800">- {formatMoney(previewSale.discount)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-400 uppercase text-[10px]">Grand Total:</span>
                                                <span className="text-blue-600 font-bold">{formatMoney(previewSale.finalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Breakdown</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3">
                                                <span className="text-[10px] text-emerald-600 uppercase font-bold">Amount Paid</span>
                                                <p className="text-sm font-bold text-emerald-700 mt-1">{formatMoney(previewSale.amountPaid)}</p>
                                            </div>
                                            <div className={`${previewSale.creditAmount > 0 ? 'bg-rose-50/50 border border-rose-100/50' : 'bg-slate-50 border border-slate-100'} rounded-xl p-3`}>
                                                <span className={`text-[10px] ${previewSale.creditAmount > 0 ? 'text-rose-600' : 'text-slate-500'} uppercase font-bold`}>Balance Due</span>
                                                <p className={`text-sm font-bold ${previewSale.creditAmount > 0 ? 'text-rose-700' : 'text-slate-700'} mt-1`}>{formatMoney(previewSale.creditAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {saleActiveTab === 'items' && (
                                <div className="space-y-3">
                                    {previewSale.items.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-800 truncate">{item.partName}</h4>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                    <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                                                    <span>•</span>
                                                    <span>Unit Price: <strong className="text-gray-700 font-medium">{formatMoney(item.unitPrice)}</strong></span>
                                                </div>
                                            </div>
                                            <span className="shrink-0 font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-xl">
                                                {formatMoney(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Sales
