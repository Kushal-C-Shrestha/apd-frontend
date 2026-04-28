import { useState, useEffect, useCallback } from 'react'
import './CustomerRegister.css'

const API_BASE = import.meta.env.VITE_API_URL

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
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
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

    if (!form.fullName.trim())
        e.fullName = 'Full name is required'
    else if (form.fullName.trim().length < 2)
        e.fullName = 'Name must be at least 2 characters'

    if (!form.phone.trim())
        e.phone = 'Phone number is required'
    else if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim()))
        e.phone = 'Enter a valid phone number (digits only, 7–15 digits)'

    if (!form.email.trim())
        e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
        e.email = 'Enter a valid email (e.g. name@example.com)'

    if (!form.vehicleNumber.trim())
        e.vehicleNumber = 'Vehicle number is required'

    if (form.year) {
        const y = parseInt(form.year)
        if (isNaN(y) || y < 1990 || y > new Date().getFullYear())
            e.year = `Year must be between 1990 and ${new Date().getFullYear()}`
    }

    return e
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
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    address: form.address.trim(),
                    vehicleNumber: form.vehicleNumber.trim(),
                    brand: form.brand.trim(),
                    model: form.model.trim(),
                    year: form.year ? parseInt(form.year) : null
                })
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                setStatus('error')
                setErrorMsg(data.message || 'Registration failed.')
                return
            }
            setStatus('success')
            setTimeout(() => {
                setStatus('idle')
                setForm(EMPTY_FORM)
                setErrors({})
            }, 3500)
        } catch {
            setStatus('error')
            setErrorMsg('Could not connect to server. Please try again.')
        }
    }

    function handleReset() {
        setForm(EMPTY_FORM)
        setErrors({})
        setStatus('idle')
        setErrorMsg('')
    }

    return (
        <div className="reg-layout">
            {status === 'success' && (
                <div className="toast">
                    <span className="toast-ico"><IcoCheck /></span>
                    <div>
                        <p className="toast-title">Customer Registered!</p>
                        <p className="toast-sub">Record saved to the system.</p>
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="toast toast-err">
                    <span className="toast-ico"><IcoX /></span>
                    <div>
                        <p className="toast-title">Registration Failed</p>
                        <p className="toast-sub">{errorMsg}</p>
                    </div>
                </div>
            )}

            <div className="reg-cols">
                <div className="reg-col">
                    <div className="block">
                        <div className="block-head">
                            <div className="block-ico" style={{ background: '#eff6ff', color: '#2563eb' }}><IcoUser /></div>
                            <div>
                                <p className="block-title">Customer Information</p>
                                <p className="block-sub">Personal &amp; contact details</p>
                            </div>
                        </div>

                        <div className={`fi ${errors.fullName ? 'fi-e' : ''}`}>
                            <label>Full Name <span className="req">*</span></label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" />
                            {errors.fullName && <p className="err-msg">{errors.fullName}</p>}
                        </div>

                        <div className={`fi ${errors.phone ? 'fi-e' : ''}`}>
                            <label>Phone Number <span className="req">*</span></label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+97798XXXXXXXX" />
                            {errors.phone && <p className="err-msg">{errors.phone}</p>}
                        </div>

                        <div className={`fi ${errors.email ? 'fi-e' : ''}`}>
                            <label>Email Address <span className="req">*</span></label>
                            <input name="email" value={form.email} onChange={handleChange} placeholder="customer@example.com" type="email" />
                            {errors.email && <p className="err-msg">{errors.email}</p>}
                        </div>

                        <div className="fi">
                            <label>Address</label>
                            <input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, District" />
                        </div>
                    </div>
                </div>

                <div className="reg-col">
                    <div className="block">
                        <div className="block-head">
                            <div className="block-ico" style={{ background: '#f0fdf4', color: '#16a34a' }}><IcoCar /></div>
                            <div>
                                <p className="block-title">Vehicle Details</p>
                                <p className="block-sub">Primary vehicle registration</p>
                            </div>
                        </div>

                        <div className={`fi ${errors.vehicleNumber ? 'fi-e' : ''}`}>
                            <label>Vehicle Number <span className="req">*</span></label>
                            <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. BA 1 CHA 1234" />
                            {errors.vehicleNumber && <p className="err-msg">{errors.vehicleNumber}</p>}
                        </div>

                        <div className="fg fg2">
                            <div className="fi">
                                <label>Brand</label>
                                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Honda" />
                            </div>
                            <div className="fi">
                                <label>Model</label>
                                <input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Civic" />
                            </div>
                        </div>

                        <div className={`fi ${errors.year ? 'fi-e' : ''}`}>
                            <label>Year</label>
                            <input name="year" value={form.year} onChange={handleChange} placeholder="2019" type="number" min="1990" max={new Date().getFullYear()} />
                            {errors.year && <p className="err-msg">{errors.year}</p>}
                        </div>

                        <div className="form-actions">
                            <button className="btn-ghost" onClick={handleReset} disabled={status === 'loading'}>Clear Form</button>
                            <button className="btn-primary" onClick={handleSubmit} disabled={status === 'loading'}>
                                {status === 'loading' ? 'Registering...' : 'Register Customer'}
                            </button>
                        </div>
                    </div>
                </div>
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
        } catch {
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCustomers(query, filter)
    }, [query, filter, fetchCustomers])

    return (
        <div className="search-layout">
            <div className="search-controls">
                <div className="sbar-wrap">
                    <span className="sbar-ico"><IcoSearch s={17} /></span>
                    <input
                        className="sbar"
                        placeholder="Search by name, phone, ID, or vehicle number..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {query && <button className="sbar-clr" onClick={() => setQuery('')}><IcoX /></button>}
                </div>
                <div className="fstrip">
                    <span className="flabel">Filter by:</span>
                    {FILTERS.map(f => (
                        <button key={f.key} className={`fchip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="results-area">
                <p className="rcount">
                    {loading ? 'Searching...' : `${customers.length} customer${customers.length !== 1 ? 's' : ''} found`}
                </p>

                {!loading && customers.length === 0 ? (
                    <div className="empty">
                        <div className="empty-ico"><IcoSearch s={26} /></div>
                        <p className="empty-h">No customers found</p>
                        <p className="empty-p">Try a different keyword or change the filter</p>
                    </div>
                ) : (
                    <div className="rlist">
                        {customers.map(c => (
                            <div key={c.customerId} className={`cc ${expandedId === c.customerId ? 'cc-open' : ''}`}
                                onClick={() => setExpandedId(p => p === c.customerId ? null : c.customerId)}>
                                <div className="cc-top">
                                    <div className="cav" style={{ background: getColor(c.fullName) + '18', color: getColor(c.fullName) }}>
                                        {getInitials(c.fullName)}
                                    </div>
                                    <div className="cc-info">
                                        <div className="cc-name-row">
                                            <span className="cc-name">{c.fullName}</span>
                                            <span className="cbadge cb-green">Active</span>
                                        </div>
                                        <p className="cc-meta">{c.customerId} · {c.phone}</p>
                                        <div className="vtags">
                                            <span className="vtag"><IcoCar s={11} />{c.vehicleNumber}</span>
                                            {(c.brand || c.model) && (
                                                <span className="vtag">{c.brand} {c.model}{c.year ? ` · ${c.year}` : ''}</span>
                                            )}
                                        </div>
                                    </div>
                                    <IcoChevron open={expandedId === c.customerId} />
                                </div>

                                {expandedId === c.customerId && (
                                    <div className="cc-detail" onClick={e => e.stopPropagation()}>
                                        <div className="dcols">
                                            <div className="dcol">
                                                <p className="dcol-title">Contact Info</p>
                                                <div className="dr"><span className="dk">Phone</span><span className="dv">{c.phone}</span></div>
                                                <div className="dr"><span className="dk">Email</span><span className="dv">{c.email}</span></div>
                                                <div className="dr"><span className="dk">Address</span><span className="dv">{c.address || '—'}</span></div>
                                                <div className="dr"><span className="dk">Customer ID</span><span className="dv">{c.customerId}</span></div>
                                            </div>
                                            <div className="dcol">
                                                <p className="dcol-title">Vehicle Info</p>
                                                <div className="dr"><span className="dk">Vehicle No.</span><span className="dv">{c.vehicleNumber || '—'}</span></div>
                                                <div className="dr"><span className="dk">Brand / Model</span><span className="dv">{c.brand} {c.model}</span></div>
                                                <div className="dr"><span className="dk">Year</span><span className="dv">{c.year || '—'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CustomerManagement() {
    const [activeTab, setActiveTab] = useState('register')

    return (
        <div className="root">
            <div className="tab-row">
                <div className="tab-left">
                    <h1 className="page-title">
                        {activeTab === 'register' ? 'Register Customer' : 'Search Customers'}
                    </h1>
                </div>
                <div className="tabs">
                    <button className={`tab ${activeTab === 'register' ? 'tab-on' : ''}`} onClick={() => setActiveTab('register')}>
                        <IcoUserPlus /><span>Register</span>
                    </button>
                    <button className={`tab ${activeTab === 'search' ? 'tab-on' : ''}`} onClick={() => setActiveTab('search')}>
                        <IcoSearch /><span>Search</span>
                    </button>
                </div>
            </div>
            <div className="content">
                {activeTab === 'register' ? <RegisterCustomer /> : <SearchCustomer />}
            </div>
        </div>
    )
}