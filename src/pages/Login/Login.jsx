import { useState, useRef, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

const IcoUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
)
const IcoLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)
const IcoMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
const IcoX = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const IcoCheck = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

function detectInputType(value) {
    const trimmed = value.trim()
    if (!trimmed) return 'unknown'
    if (/^\+?[0-9\s\-()]{7,}$/.test(trimmed)) return 'phone'
    if (trimmed.includes('@')) return 'email'
    return 'unknown'
}

function validateIdentifier(value) {
    const trimmed = value.trim()
    if (!trimmed) return 'Email or phone number is required'
    const isPhone = /^\+?[0-9]{7,15}$/.test(trimmed)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
    if (!isPhone && !isEmail) return 'Enter a valid email address or phone number'
    return ''
}

const inpStyle = (hasError) => ({
    width: '100%', padding: '11px 44px 11px 40px',
    border: `1.5px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
    borderRadius: '10px', fontSize: '14px', color: '#111827',
    background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
})

function onFocus(e, hasError) {
    e.target.style.borderColor = hasError ? '#dc2626' : '#2563eb'
    e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : '0 0 0 3px rgba(37,99,235,0.1)'
}
function onBlur(e, hasError) {
    e.target.style.borderColor = hasError ? '#dc2626' : '#e5e7eb'
    e.target.style.boxShadow = 'none'
}

function ForgotPasswordModal({ onClose }) {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(0)
    const otpRefs = useRef([])

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
            return () => clearTimeout(t)
        }
    }, [resendTimer])

    async function handleSendOtp() {
        if (!email.trim()) { setError('Email is required'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError('Enter a valid email address'); return }
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            })
            const data = await res.json()
            if (!res.ok || !data.success) { setError(data.message || 'Failed to send OTP.'); setLoading(false); return }
            setStep(2)
            setResendTimer(60)
        } catch {
            setError('Could not connect to server.')
        }
        setLoading(false)
    }

    async function handleResendOtp() {
        if (resendTimer > 0) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            })
            const data = await res.json()
            if (!res.ok || !data.success) { setError(data.message || 'Failed to resend OTP.'); setLoading(false); return }
            setOtp(['', '', '', '', '', ''])
            setResendTimer(60)
            otpRefs.current[0]?.focus()
        } catch {
            setError('Could not connect to server.')
        }
        setLoading(false)
    }

    function handleOtpChange(index, value) {
        if (!/^[0-9]?$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError('')
        if (value && index < 5) otpRefs.current[index + 1]?.focus()
    }

    function handleOtpKeyDown(index, e) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    function handleOtpPaste(e) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]
        pasted.split('').forEach((ch, i) => { newOtp[i] = ch })
        setOtp(newOtp)
        otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    async function handleVerifyOtp() {
        const code = otp.join('')
        if (code.length < 6) { setError('Please enter the complete 6-digit OTP.'); return }
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otpCode: code })
            })
            const data = await res.json()
            if (!res.ok || !data.success) { setError(data.message || 'Invalid OTP.'); setLoading(false); return }
            setStep(3)
        } catch {
            setError('Could not connect to server.')
        }
        setLoading(false)
    }

    async function handleResetPassword() {
        if (!newPassword) { setError('Password is required'); return }
        if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otpCode: otp.join(''), newPassword })
            })
            const data = await res.json()
            if (!res.ok || !data.success) { setError(data.message || 'Failed to reset password.'); setLoading(false); return }
            setStep(4)
        } catch {
            setError('Could not connect to server.')
        }
        setLoading(false)
    }

    const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }
    const modal = { background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }
    const btnPrimary = (disabled) => ({ width: '100%', padding: '12px', background: disabled ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' })

    return (
        <div style={overlay} onClick={onClose}>
            <div style={modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px', borderRadius: '6px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                    <IcoX />
                </button>

                {step === 1 && (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Forgot Password</h2>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>Enter your email address and we'll send you an OTP to reset your password.</p>
                        </div>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>{error}</div>}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}><IcoMail /></span>
                                <input
                                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                                    placeholder="you@example.com"
                                    style={inpStyle(!!error)}
                                    onFocus={e => onFocus(e, !!error)}
                                    onBlur={e => onBlur(e, !!error)}
                                />
                            </div>
                        </div>
                        <button onClick={handleSendOtp} disabled={loading} style={btnPrimary(loading)}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Enter OTP</h2>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>We sent a 6-digit OTP to <strong>{email}</strong>. It expires in 10 minutes.</p>
                        </div>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>{error}</div>}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => otpRefs.current[i] = el}
                                    type="text" inputMode="numeric" maxLength={1} value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    style={{ width: '48px', height: '54px', textAlign: 'center', fontSize: '22px', fontWeight: '700', color: '#111827', border: `1.5px solid ${digit ? '#2563eb' : '#e5e7eb'}`, borderRadius: '10px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'border-color 0.15s', background: digit ? '#eff6ff' : '#fff' }}
                                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                                    onBlur={e => e.target.style.borderColor = digit ? '#2563eb' : '#e5e7eb'}
                                />
                            ))}
                        </div>
                        <button onClick={handleVerifyOtp} disabled={loading} style={{ ...btnPrimary(loading), marginBottom: '12px' }}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                            Didn't receive it?{' '}
                            <button onClick={handleResendOtp} disabled={resendTimer > 0}
                                style={{ background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', color: resendTimer > 0 ? '#9ca3af' : '#2563eb', fontWeight: '600', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0 }}>
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </p>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Set New Password</h2>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>Create a new strong password for your account.</p>
                        </div>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>{error}</div>}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}><IcoLock /></span>
                                <input
                                    type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }}
                                    placeholder="Minimum 8 characters"
                                    style={inpStyle(false)}
                                    onFocus={e => onFocus(e, false)}
                                    onBlur={e => onBlur(e, false)}
                                />
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                                    <button type="button" onClick={() => setShowNew(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}>
                                        {showNew ? <IcoEyeOff /> : <IcoEye />}
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}><IcoLock /></span>
                                <input
                                    type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                                    placeholder="Re-enter new password"
                                    style={{ ...inpStyle(false), borderColor: confirmPassword && newPassword === confirmPassword ? '#16a34a' : undefined }}
                                    onFocus={e => onFocus(e, false)}
                                    onBlur={e => onBlur(e, false)}
                                />
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                                    <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}>
                                        {showConfirm ? <IcoEyeOff /> : <IcoEye />}
                                    </button>
                                </span>
                            </div>
                        </div>
                        <button onClick={handleResetPassword} disabled={loading} style={btnPrimary(loading)}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{ width: '64px', height: '64px', background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <IcoCheck />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Password Reset!</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Your password has been reset successfully. You can now sign in with your new password.</p>
                        <button onClick={onClose} style={btnPrimary(false)}>Back to Login</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Login() {
    const [form, setForm] = useState({ identifier: '', password: '' })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')
    const [showForgot, setShowForgot] = useState(false)

    const inputType = detectInputType(form.identifier)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
        if (serverError) setServerError('')
    }

    function validate() {
        const e = {}
        const identifierErr = validateIdentifier(form.identifier)
        if (identifierErr) e.identifier = identifierErr
        if (!form.password.trim()) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setLoading(true)
        setServerError('')
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: form.identifier.trim(), password: form.password })
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                setServerError(data.message || 'Login failed. Please try again.')
                setLoading(false)
                return
            }
            const { token, role, userId, fullName, email, phone, customerId } = data.data
            localStorage.setItem('token', token)
            localStorage.setItem('role', role)
            localStorage.setItem('userId', userId)
            localStorage.setItem('fullName', fullName)
            localStorage.setItem('email', email)
            localStorage.setItem('phone', phone)
            localStorage.setItem('customerId', customerId)
            if (role === 'Admin') window.location.href = '/admin/dashboard'
            else if (role === 'Staff') window.location.href = '/staff/dashboard'
            else if (role === 'Customer') window.location.href = '/customer/dashboard'
        } catch {
            setServerError('Could not connect to server. Please try again.')
            setLoading(false)
        }
    }

    const inp = (field) => ({
        width: '100%', padding: '11px 44px 11px 40px',
        border: `1.5px solid ${errors[field] ? '#dc2626' : '#e5e7eb'}`,
        borderRadius: '10px', fontSize: '14px', color: '#111827',
        background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    })

    function onFocusField(e, field) {
        e.target.style.borderColor = errors[field] ? '#dc2626' : '#2563eb'
        e.target.style.boxShadow = errors[field] ? '0 0 0 3px rgba(220,38,38,0.08)' : '0 0 0 3px rgba(37,99,235,0.1)'
    }
    function onBlurField(e, field) {
        e.target.style.borderColor = errors[field] ? '#dc2626' : '#e5e7eb'
        e.target.style.boxShadow = 'none'
    }

    const typeBadgeLabel = inputType === 'email' ? 'Email' : inputType === 'phone' ? 'Phone' : null

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif', WebkitFontSmoothing: 'antialiased', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px', marginBottom: '8px' }}>Welcome back</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Sign in to your account to continue</p>
                </div>

                {serverError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Email or Phone Number</label>
                            {typeBadgeLabel && (
                                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: inputType === 'email' ? '#eff6ff' : '#f0fdf4', color: inputType === 'email' ? '#2563eb' : '#16a34a', border: `1px solid ${inputType === 'email' ? '#bfdbfe' : '#bbf7d0'}` }}>
                                    {typeBadgeLabel}
                                </span>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: errors.identifier ? '#dc2626' : '#9ca3af', display: 'flex', pointerEvents: 'none' }}><IcoUser /></span>
                            <input name="identifier" type="text" value={form.identifier} onChange={handleChange} placeholder="you@example.com or 98XXXXXXXX" style={inp('identifier')} onFocus={e => onFocusField(e, 'identifier')} onBlur={e => onBlurField(e, 'identifier')} autoComplete="username" />
                        </div>
                        {errors.identifier && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{errors.identifier}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#dc2626' : '#9ca3af', display: 'flex', pointerEvents: 'none' }}><IcoLock /></span>
                            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter your password" style={inp('password')} onFocus={e => onFocusField(e, 'password')} onBlur={e => onBlurField(e, 'password')} autoComplete="current-password" />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }} onMouseEnter={e => e.currentTarget.style.color = '#6b7280'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                                    {showPassword ? <IcoEyeOff /> : <IcoEye />}
                                </button>
                            </span>
                        </div>
                        {errors.password && <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>{errors.password}</p>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                        <button type="button" onClick={() => setShowForgot(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#2563eb', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" disabled={loading}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s, transform 0.1s', letterSpacing: '-0.1px' }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8' }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563eb' }}
                        onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                        {loading ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                    Don't have an account?{' '}
                    <a href="/register" style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'none' }} onMouseEnter={e => e.target.style.textDecoration = 'underline'} onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                        Register here
                    </a>
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}