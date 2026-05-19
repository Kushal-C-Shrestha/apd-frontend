import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

const IcoUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
)
const IcoMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
)
const IcoPhone = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1.16h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)
const IcoLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)
const IcoEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
)
const IcoEyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
)
const IcoArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
)

function getPasswordStrength(password) {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { score, label: 'Weak', color: '#dc2626' }
    if (score === 2) return { score, label: 'Fair', color: '#d97706' }
    if (score === 3) return { score, label: 'Good', color: '#2563eb' }
    return { score, label: 'Strong', color: '#16a34a' }
}

function inp(hasError) {
    return {
        width: '100%', padding: '11px 44px 11px 40px',
        border: `1.5px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
        borderRadius: '10px', fontSize: '14px', color: '#111827',
        background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    }
}

function onFocus(e, hasError) {
    e.target.style.borderColor = hasError ? '#dc2626' : '#2563eb'
    e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : '0 0 0 3px rgba(37,99,235,0.1)'
}

function onBlur(e, hasError, extraBorder) {
    e.target.style.borderColor = extraBorder || (hasError ? '#dc2626' : '#e5e7eb')
    e.target.style.boxShadow = 'none'
}

function Field({ label, name, type, value, onChange, placeholder, error, icon, hint, rightSlot }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: error ? '#dc2626' : '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                    {icon}
                </span>
                <input
                    name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
                    style={inp(!!error)}
                    onFocus={e => onFocus(e, !!error)}
                    onBlur={e => onBlur(e, !!error)}
                />
                {rightSlot && (
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                        {rightSlot}
                    </span>
                )}
            </div>
            {hint && !error && <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{hint}</p>}
            {error && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{error}</p>}
        </div>
    )
}

function PasswordRule({ met, text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: met ? '#f0fdf4' : '#f3f4f6', color: met ? '#16a34a' : '#9ca3af', border: `1px solid ${met ? '#bbf7d0' : '#e5e7eb'}`, transition: 'all 0.2s' }}>
                {met
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                }
            </span>
            <span style={{ fontSize: '12px', color: met ? '#15803d' : '#9ca3af', fontWeight: '500', transition: 'color 0.2s' }}>{text}</span>
        </div>
    )
}

export default function Signup() {
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [serverError, setServerError] = useState('')

    const strength = getPasswordStrength(form.password)
    const passwordRules = [
        { met: form.password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
        { met: /[0-9]/.test(form.password), text: 'One number' },
        { met: /[^A-Za-z0-9]/.test(form.password), text: 'One special character' },
    ]

    function handleChange(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
        if (serverError) setServerError('')
    }

    function validate() {
        const e = {}
        if (!form.fullName.trim()) e.fullName = 'Full name is required'
        else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters'
        if (!form.email.trim()) e.email = 'Email address is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email address'
        if (!form.phone.trim()) e.phone = 'Phone number is required'
        else if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits)'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true)
        setServerError('')

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    password: form.password
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setServerError(data.message || 'Registration failed. Please try again.')
                setLoading(false)
                return
            }

            setLoading(false)
            setSuccess(true)

        } catch {
            setServerError('Could not connect to server. Please try again.')
            setLoading(false)
        }
    }

    const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword

    if (success) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif', WebkitFontSmoothing: 'antialiased', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
                <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '68px', height: '68px', background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.4px', marginBottom: '8px' }}>Account Created!</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
                        Welcome, {form.fullName.split(' ')[0]}! Your account has been created successfully.
                    </p>
                    <a href="/login"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', textDecoration: 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                        Go to Login <IcoArrow />
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif', WebkitFontSmoothing: 'antialiased', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

            <div style={{ maxWidth: '480px', width: '100%' }}>

                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px', marginBottom: '8px' }}>Create an account</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Fill in your details to get started</p>
                </div>

                {serverError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    <Field label="Full Name" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" error={errors.fullName} icon={<IcoUser />} />

                    <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} icon={<IcoMail />} />

                    <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX or +977XXXXXXXXXX" error={errors.phone} icon={<IcoPhone />} hint="Include country code for international numbers" />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#dc2626' : '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                                <IcoLock />
                            </span>
                            <input
                                name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                                placeholder="Create a strong password"
                                style={inp(!!errors.password)}
                                onFocus={e => onFocus(e, !!errors.password)}
                                onBlur={e => onBlur(e, !!errors.password)}
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                                    {showPassword ? <IcoEyeOff /> : <IcoEye />}
                                </button>
                            </span>
                        </div>

                        {form.password && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength.score ? strength.color : '#e5e7eb', transition: 'background 0.25s' }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: strength.color }}>{strength.label}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-[6px]">
                                    {passwordRules.map((r, i) => <PasswordRule key={i} met={r.met} text={r.text} />)}
                                </div>
                            </div>
                        )}
                        {errors.password && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{errors.password}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? '#dc2626' : '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                                <IcoLock />
                            </span>
                            <input
                                name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange}
                                placeholder="Re-enter your password"
                                style={{ ...inp(!!errors.confirmPassword), borderColor: errors.confirmPassword ? '#dc2626' : passwordsMatch ? '#16a34a' : '#e5e7eb' }}
                                onFocus={e => onFocus(e, !!errors.confirmPassword)}
                                onBlur={e => onBlur(e, !!errors.confirmPassword, passwordsMatch ? '#16a34a' : undefined)}
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {passwordsMatch && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                                <button type="button" onClick={() => setShowConfirm(p => !p)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                                    {showConfirm ? <IcoEyeOff /> : <IcoEye />}
                                </button>
                            </span>
                        </div>
                        {errors.confirmPassword && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s, transform 0.1s', letterSpacing: '-0.1px' }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8' }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563eb' }}
                        onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {loading ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Creating account...
                            </>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <a href="/login" style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                        Sign in
                    </a>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}