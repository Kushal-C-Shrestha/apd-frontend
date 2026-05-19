import { useState, useRef } from 'react'

function generateId() {
    return 'CUS-' + Math.floor(1000 + Math.random() * 9000)
}

const IcoUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
)

const IcoCar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
)

const IcoCamera = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
)

const IcoCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

function Field({ label, required, error, children, noMargin }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: noMargin ? 0 : '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
                {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            {children}
            {error && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{error}</p>}
        </div>
    )
}

function Input({ hasError, readOnly, idStyle, ...props }) {
    const base = {
        padding: '11px 14px',
        border: `1.5px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
        borderRadius: '10px',
        fontSize: idStyle ? '13px' : '14px',
        color: idStyle ? '#9ca3af' : '#1f2937',
        background: idStyle ? '#f3f4f6' : '#f9fafb',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        cursor: readOnly ? 'default' : 'text',
        letterSpacing: idStyle ? '0.3px' : 'normal',
    }
    return (
        <input
            {...props}
            readOnly={readOnly}
            style={base}
            onFocus={e => {
                if (readOnly) return
                e.target.style.borderColor = hasError ? '#dc2626' : '#2563eb'
                e.target.style.background = '#ffffff'
                e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : '0 0 0 3px rgba(37,99,235,0.1)'
            }}
            onBlur={e => {
                if (readOnly) return
                e.target.style.borderColor = hasError ? '#dc2626' : '#e5e7eb'
                e.target.style.background = idStyle ? '#f3f4f6' : '#f9fafb'
                e.target.style.boxShadow = 'none'
            }}
        />
    )
}

function Card({ children }) {
    return (
        <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            width: '100%',
        }}>
            {children}
        </div>
    )
}

function CardHeader({ iconBg, iconColor, icon, title, sub }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', letterSpacing: '-0.2px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>{sub}</p>
            </div>
        </div>
    )
}

export default function CustomerSelfRegister() {
    const [form, setForm] = useState({
        fullName: '', phone: '', email: '', address: '',
        vehicleNumber: '', brand: '', model: '', year: '',
    })
    const [photo, setPhoto] = useState(null)
    const [preview, setPreview] = useState(null)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)
    const [customerId] = useState(generateId)
    const fileRef = useRef()

    function handleChange(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
    }

    function handlePhoto(e) {
        const file = e.target.files[0]
        if (!file) return
        setPhoto(file)
        setPreview(URL.createObjectURL(file))
    }

    function validate() {
        const e = {}
        if (!form.fullName.trim()) e.fullName = 'Required'
        if (!form.phone.trim()) e.phone = 'Required'
        if (!form.email.trim()) e.email = 'Required'
        if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Required'
        return e
    }

    function handleSubmit() {
        const e = validate()
        if (Object.keys(e).length > 0) { setErrors(e); return }
        setSuccess(true)
        setTimeout(() => {
            setSuccess(false)
            setForm({ fullName: '', phone: '', email: '', address: '', vehicleNumber: '', brand: '', model: '', year: '' })
            setPhoto(null); setPreview(null); setErrors({})
        }, 3500)
    }

    function handleReset() {
        setForm({ fullName: '', phone: '', email: '', address: '', vehicleNumber: '', brand: '', model: '', year: '' })
        setPhoto(null); setPreview(null); setErrors({}); setSuccess(false)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#f9fafb', fontFamily: 'Plus Jakarta Sans, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '20px 32px', width: '100%' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.4px' }}>
                    Register Account
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>
                    Create your customer profile and register your vehicle
                </p>
            </div>

            <div style={{ flex: 1, width: '100%', padding: '28px 32px 48px' }}>
                {success && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
                        <span style={{ width: '28px', height: '28px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                            <IcoCheck />
                        </span>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>Account Created!</p>
                            <p style={{ fontSize: '13px', color: '#15803d', marginTop: '1px' }}>Your profile has been registered successfully.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                    <Card>
                        <CardHeader iconBg="#eff6ff" iconColor="#2563eb" icon={<IcoUser />} title="Customer Information" sub="Personal & contact details" />

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                            <div
                                onClick={() => fileRef.current.click()}
                                style={{
                                    width: '88px', height: '88px', borderRadius: '50%',
                                    border: '2px dashed #d1d5db',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    backgroundImage: preview ? `url(${preview})` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                                    transition: 'border-color 0.15s',
                                    marginBottom: '10px', position: 'relative', overflow: 'hidden',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                            >
                                {!preview && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#9ca3af', pointerEvents: 'none' }}>
                                        <IcoCamera />
                                        <span style={{ fontSize: '12px', fontWeight: '500' }}>Upload photo</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                            <p style={{ fontSize: '12px', color: '#9ca3af' }}>JPG or PNG · max 2MB</p>
                            {preview && (
                                <button
                                    onClick={() => { setPhoto(null); setPreview(null) }}
                                    style={{ marginTop: '6px', fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '2px 0' }}
                                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                                >
                                    Remove photo
                                </button>
                            )}
                        </div>

                        <Field label="Full Name" required error={errors.fullName}>
                            <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" hasError={!!errors.fullName} />
                        </Field>
                        <Field label="Phone Number" required error={errors.phone}>
                            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" hasError={!!errors.phone} />
                        </Field>
                        <Field label="Email Address" required error={errors.email}>
                            <Input name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" type="email" hasError={!!errors.email} />
                        </Field>
                        <Field label="Address">
                            <Input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, District" hasError={false} />
                        </Field>
                        <Field label="Customer ID" noMargin>
                            <Input value={customerId} readOnly idStyle />
                        </Field>
                    </Card>

                    <Card>
                        <CardHeader iconBg="#f0fdf4" iconColor="#16a34a" icon={<IcoCar />} title="Vehicle Details" sub="Primary vehicle registration" />

                        <Field label="Vehicle Number" required error={errors.vehicleNumber}>
                            <Input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. BA 1 CHA 1234" hasError={!!errors.vehicleNumber} />
                        </Field>

                        <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-1 md:grid-cols-2">
                            <Field label="Brand">
                                <Input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Honda" hasError={false} />
                            </Field>
                            <Field label="Model">
                                <Input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Civic" hasError={false} />
                            </Field>
                        </div>

                        <Field label="Year">
                            <Input name="year" value={form.year} onChange={handleChange} placeholder="e.g. 2019" type="number" min="1990" max="2025" hasError={false} />
                        </Field>

                        <div
                            style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}
                            className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
                        >
                            <button
                                onClick={handleReset}
                                style={{ background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', padding: '11px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.target.style.background = '#f9fafb'; e.target.style.color = '#374151'; e.target.style.borderColor = '#d1d5db' }}
                                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6b7280'; e.target.style.borderColor = '#e5e7eb' }}
                            >
                                Clear Form
                            </button>
                            <button
                                onClick={handleSubmit}
                                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s, transform 0.1s', letterSpacing: '-0.1px' }}
                                onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                                onMouseLeave={e => e.target.style.background = '#2563eb'}
                                onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.target.style.transform = 'scale(1)'}
                            >
                                Register Customer
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}