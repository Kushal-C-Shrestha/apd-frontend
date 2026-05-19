import { useState, useEffect, useCallback } from 'react'

const IcoUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
)
const IcoCar = ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
)
const IcoSearch = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
)
const IcoCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)
const IcoChevron = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const IcoX = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const IcoUserPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
)


const AVATAR_COLORS = ['#2563eb', '#0f766e', '#7c3aed', '#d97706', '#dc2626', '#059669']
function getColor(name = '') {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function getInitials(fullName = '') {
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'id', label: 'Customer ID' },
    { key: 'vehicle', label: 'Vehicle No.' },
]

const EMPTY_FORM = {
    fullName: '', phone: '', email: '', address: '',
    vehicleNumber: '', brand: '', model: '', year: ''
}

function validate(form) {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (digits only, 7–15 digits)'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email (e.g. name@example.com)'
    if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Vehicle number is required'
    if (form.year) {
        const y = parseInt(form.year)
        if (isNaN(y) || y < 1990 || y > new Date().getFullYear())
            e.year = `Year must be between 1990 and ${new Date().getFullYear()}`
    }
    return e
}

const API_BASE = import.meta.env.VITE_API_URL


function Field({ label, required, error, children }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            {children}
            {error && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500', marginTop: '4px' }}>{error}</p>}
        </div>
    )
}


function Input({ hasError, style: extraStyle, ...props }) {
    const base = {
        width: '100%',
        padding: '10px 13px',
        border: `1.5px solid ${hasError ? '#dc2626' : '#e2e8f0'}`,
        borderRadius: '10px',
        fontSize: '14px',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        outline: 'none',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...extraStyle,
    }
    return (
        <input
            {...props}
            style={base}
            onFocus={e => {
                e.target.style.borderColor = hasError ? '#dc2626' : '#2563eb'
                e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(220,38,38,0.1)' : '0 0 0 3px rgba(37,99,235,0.1)'
            }}
            onBlur={e => {
                e.target.style.borderColor = hasError ? '#dc2626' : '#e2e8f0'
                e.target.style.boxShadow = 'none'
            }}
        />
    )
}


function Card({ children }) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}>
            {children}
        </div>
    )
}

function CardHeader({ iconBg, iconColor, icon, title, sub }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '22px', paddingBottom: '18px',
            borderBottom: '1px solid #f1f5f9'
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: iconBg, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{title}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{sub}</p>
            </div>
        </div>
    )
}


function RegisterCustomer() {
    const [form, setForm] = useState(EMPTY_FORM)
    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [errors, setErrors] = useState({})

    function handleChange(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
    }

    async function handleSubmit() {
        const e = validate(form)
        if (Object.keys(e).length > 0) { setErrors(e); return }
        setStatus('loading')
        setErrorMsg('')
        try {
            const res = await fetch(`${API_BASE}/customer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName.trim(), phone: form.phone.trim(),
                    email: form.email.trim(), address: form.address.trim(),
                    vehicleNumber: form.vehicleNumber.trim(), brand: form.brand.trim(),
                    model: form.model.trim(), year: form.year ? parseInt(form.year) : null
                })
            })
            const data = await res.json()
            if (!res.ok || !data.success) { setStatus('error'); setErrorMsg(data.message || 'Registration failed.'); return }
            setStatus('success')
            setTimeout(() => { setStatus('idle'); setForm(EMPTY_FORM); setErrors({}) }, 3500)
        } catch {
            setStatus('error'); setErrorMsg('Could not connect to server. Please try again.')
        }
    }

    function handleReset() { setForm(EMPTY_FORM); setErrors({}); setStatus('idle'); setErrorMsg('') }

    return (
        <div style={{ width: '100%' }}>

            {/* Success */}
            {status === 'success' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
                    <span style={{ width: '28px', height: '28px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><IcoCheck /></span>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>Customer Registered!</p>
                        <p style={{ fontSize: '13px', color: '#15803d', marginTop: '1px' }}>Record saved to the system.</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
                    <span style={{ width: '28px', height: '28px', background: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><IcoX /></span>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>Registration Failed</p>
                        <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '1px' }}>{errorMsg}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Customer Info */}
                <Card>
                    <CardHeader iconBg="#eff6ff" iconColor="#2563eb" icon={<IcoUser />} title="Customer Information" sub="Personal & contact details" />
                    <Field label="Full Name" required error={errors.fullName}>
                        <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" hasError={!!errors.fullName} />
                    </Field>
                    <Field label="Phone Number" required error={errors.phone}>
                        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+97798XXXXXXXX" hasError={!!errors.phone} />
                    </Field>
                    <Field label="Email Address" required error={errors.email}>
                        <Input name="email" value={form.email} onChange={handleChange} placeholder="customer@example.com" type="email" hasError={!!errors.email} />
                    </Field>
                    <Field label="Address">
                        <Input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, District" hasError={false} />
                    </Field>
                </Card>

                {/* Vehicle Details */}
                <Card>
                    <CardHeader iconBg="#f0fdf4" iconColor="#16a34a" icon={<IcoCar />} title="Vehicle Details" sub="Primary vehicle registration" />
                    <Field label="Vehicle Number" required error={errors.vehicleNumber}>
                        <Input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. BA 1 CHA 1234" hasError={!!errors.vehicleNumber} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Brand">
                            <Input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Honda" hasError={false} />
                        </Field>
                        <Field label="Model">
                            <Input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Civic" hasError={false} />
                        </Field>
                    </div>
                    <Field label="Year" error={errors.year}>
                        <Input name="year" value={form.year} onChange={handleChange} placeholder="2019" type="number" min="1990" max={new Date().getFullYear()} hasError={!!errors.year} />
                    </Field>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end" style={{ marginTop: '6px' }}>
                        <button
                            onClick={handleReset} disabled={status === 'loading'}
                            style={{ background: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '11px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.target.style.background = '#f8fafc'; e.target.style.color = '#334155' }}
                            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b' }}
                        >
                            Clear Form
                        </button>
                        <button
                            onClick={handleSubmit} disabled={status === 'loading'}
                            style={{ background: status === 'loading' ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (status !== 'loading') e.target.style.background = '#1d4ed8' }}
                            onMouseLeave={e => { if (status !== 'loading') e.target.style.background = '#2563eb' }}
                        >
                            {status === 'loading' ? 'Registering...' : 'Register Customer'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}


function SearchCustomer() {
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('all')
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    const fetchCustomers = useCallback(async (q, f) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ query: q, filter: f })
            const res = await fetch(`${API_BASE}/customer/search?${params}`)
            const data = await res.json()
            if (data.success) setCustomers(data.data)
        } catch { setCustomers([]) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchCustomers(query, filter) }, [query, filter, fetchCustomers])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

            {/* Search controls */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                        <IcoSearch s={17} />
                    </span>
                    <input
                        style={{ width: '100%', padding: '12px 44px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', background: '#f8fafc', fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                        placeholder="Search by name, phone, ID, or vehicle number..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.background = '#fff' }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc' }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}>
                            <IcoX />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Filter by:</span>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: `1.5px solid ${filter === f.key ? '#bfdbfe' : '#e2e8f0'}`, cursor: 'pointer', background: filter === f.key ? '#eff6ff' : 'transparent', color: filter === f.key ? '#2563eb' : '#64748b', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div>
                <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', marginBottom: '10px' }}>
                    {loading ? 'Searching...' : `${customers.length} customer${customers.length !== 1 ? 's' : ''} found`}
                </p>

                {!loading && customers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                        <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#94a3b8' }}>
                            <IcoSearch s={26} />
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>No customers found</p>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>Try a different keyword or change the filter</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {customers.map(c => {
                            const color = getColor(c.fullName)
                            const isOpen = expandedId === c.customerId
                            return (
                                <div
                                    key={c.customerId}
                                    onClick={() => setExpandedId(p => p === c.customerId ? null : c.customerId)}
                                    style={{ background: '#fff', border: `1.5px solid ${isOpen ? '#2563eb' : '#e2e8f0'}`, borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                                    onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' } }}
                                    onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' } }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, background: color + '18', color }}>
                                            {getInitials(c.fullName)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{c.fullName}</span>
                                                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 9px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a' }}>Active</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>{c.customerId} · {c.phone}</p>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 9px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                                    <IcoCar s={11} />{c.vehicleNumber}
                                                </span>
                                                {(c.brand || c.model) && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 9px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                                        {c.brand} {c.model}{c.year ? ` · ${c.year}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <IcoChevron open={isOpen} />
                                    </div>

                                    {isOpen && (
                                        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '14px' }} onClick={e => e.stopPropagation()}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {[
                                                    { title: 'Contact Info', rows: [['Phone', c.phone], ['Email', c.email], ['Address', c.address || '—'], ['Customer ID', c.customerId]] },
                                                    { title: 'Vehicle Info', rows: [['Vehicle No.', c.vehicleNumber || '—'], ['Brand / Model', `${c.brand} ${c.model}`], ['Year', c.year || '—']] },
                                                ].map(({ title, rows }) => (
                                                    <div key={title}>
                                                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{title}</p>
                                                        {rows.map(([k, v]) => (
                                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', gap: '12px' }}>
                                                                <span style={{ color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 }}>{k}</span>
                                                                <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}


export default function CustomerManagement() {
    const [activeTab, setActiveTab] = useState('register')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#f8fafc', fontFamily: 'Plus Jakarta Sans, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px 0', background: '#fff', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.4px', paddingBottom: '16px' }}>
                    {activeTab === 'register' ? 'Register Customer' : 'Search Customers'}
                </h1>
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '14px', marginBottom: '16px' }}>
                    {[
                        { key: 'register', label: 'Register', Icon: IcoUserPlus },
                        { key: 'search', label: 'Search', Icon: IcoSearch },
                    ].map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '10px', cursor: 'pointer', border: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s', background: activeTab === key ? '#fff' : 'transparent', color: activeTab === key ? '#2563eb' : '#64748b', boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' : 'none' }}>
                            <Icon /><span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, width: '100%', padding: '28px 32px 40px' }}>
                {activeTab === 'register' ? <RegisterCustomer /> : <SearchCustomer />}
            </div>
        </div>
    )
}