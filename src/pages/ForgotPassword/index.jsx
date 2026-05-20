import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordEmailSchema, verifyOtpSchema, resetPasswordSchema } from '@/schemas/auth'
import api from '@/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Reset
    const [email, setEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Form for Step 1: Email
    const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
        resolver: zodResolver(forgotPasswordEmailSchema)
    })

    // Form for Step 2: OTP
    const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm({
        resolver: zodResolver(verifyOtpSchema)
    })

    // Form for Step 3: Reset Password
    const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    })

    const onEmailSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/forgot-password', { email: data.email })
            if (res.data.success) {
                setEmail(data.email)
                setStep(2)
                toast.success(res.data.message || 'OTP sent to your email.')
            } else {
                toast.error(res.data.message || 'Failed to send OTP')
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            const serverErrors = error.response?.data?.errors
            if (serverErrors) {
                Object.values(serverErrors).forEach(err => toast.error(err[0]))
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    const onOtpSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/verify-otp', { email, otpCode: data.otpCode })
            if (res.data.success) {
                setOtpCode(data.otpCode)
                setStep(3)
                toast.success(res.data.message || 'OTP verified.')
            } else {
                toast.error(res.data.message || 'Invalid OTP')
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            const serverErrors = error.response?.data?.errors
            if (serverErrors) {
                Object.values(serverErrors).forEach(err => toast.error(err[0]))
            } else {
                toast.error(error.response?.data?.message || 'Invalid OTP')
            }
        } finally {
            setLoading(false)
        }
    }

    const onResetSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/reset-password', {
                email,
                otpCode,
                newPassword: data.newPassword
            })
            if (res.data.success) {
                toast.success('Password reset successfully. You can now login.')
                navigate('/login')
            } else {
                toast.error(res.data.message || 'Failed to reset password')
            }
        } catch (error) {
            console.error('Reset password error:', error)
            const serverErrors = error.response?.data?.errors
            if (serverErrors) {
                Object.values(serverErrors).forEach(err => toast.error(err[0]))
            } else {
                toast.error(error.response?.data?.message || 'Failed to reset password')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to login
                </Link>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Enter OTP"}
                    {step === 3 && "Reset Password"}
                </h2>
                <p className="text-sm text-slate-500">
                    {step === 1 && "Enter your email address to receive a one-time password."}
                    {step === 2 && `We sent a code to ${email}`}
                    {step === 3 && "Enter your new password below."}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
                            Email Address
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={16} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                placeholder="name@example.com"
                                disabled={loading}
                                {...registerEmail('email')}
                            />
                        </div>
                        {emailErrors.email && (
                            <p className="mt-1 text-xs text-rose-500 font-medium">{emailErrors.email.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1e2e4a] hover:bg-[#152238] px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Send OTP</span>}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label htmlFor="otpCode" className="text-xs font-semibold text-slate-600">
                            OTP Code
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <KeyRound size={16} />
                            </div>
                            <input
                                id="otpCode"
                                type="text"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                placeholder="Enter 6-digit OTP"
                                disabled={loading}
                                {...registerOtp('otpCode')}
                            />
                        </div>
                        {otpErrors.otpCode && (
                            <p className="mt-1 text-xs text-rose-500 font-medium">{otpErrors.otpCode.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1e2e4a] hover:bg-[#152238] px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Verify OTP</span>}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="text-xs font-semibold text-slate-600">
                                New Password
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    {...registerReset('newPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {resetErrors.newPassword && (
                                <p className="mt-1 text-xs text-rose-500 font-medium">{resetErrors.newPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600">
                                Confirm New Password
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                    {...registerReset('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {resetErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-rose-500 font-medium">{resetErrors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1e2e4a] hover:bg-[#152238] px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Reset Password</span>}
                    </button>
                </form>
            )}
        </div>
    )
}

export default ForgotPassword
