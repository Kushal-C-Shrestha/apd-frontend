import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/schemas/auth'
import api from '@/api'
import useAuth from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const { data: responseData } = await api.post('/auth/login', {
                identifier: data.identifier,
                password: data.password
            })

            if (responseData.success) {
                const token = responseData.data?.token
                const refreshToken = responseData.data?.refreshToken
                if (token) {
                    const fullName = responseData.data?.fullName ?? ''
                    const firstName = fullName
                        .replace(/\b(Customer|Staff|Admin)\b/gi, '')
                        .trim()
                        .split(' ')[0]
                    login(token, refreshToken)
                    toast.success(`Welcome back, ${firstName}!`)

                    // Role-based redirection
                    const role = responseData.data?.role
                    if (role === 'Admin') {
                        navigate('/admin/dashboard')
                    } else if (role === 'Staff') {
                        navigate('/staff/dashboard')
                    } else {
                        navigate('/customer/appointments')
                    }
                } else {
                    toast.error('Login successful, but no token received.')
                }
            } else {
                toast.error(responseData.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            const serverErrors = error.response?.data?.errors
            if (serverErrors) {
                Object.entries(serverErrors).forEach(([field, message]) => {
                    setError(field, { type: 'server', message })
                })
            } else {
                const msg = error.response?.data?.message || 'Invalid credentials or server error'
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome back
                </h2>
                <p className="text-sm text-slate-500">
                    Please enter your credentials to access your dashboard.
                </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Identifier field (Email or Phone) */}
                    <div className="space-y-1.5">
                        <label htmlFor="identifier" className="text-xs font-semibold text-slate-600">
                            Email or Phone Number
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={16} />
                            </div>
                            <input
                                id="identifier"
                                type="text"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your email or phone number"
                                autoComplete="email"
                                disabled={loading}
                                {...register('identifier')}
                            />
                        </div>
                        {errors.identifier && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.identifier.message}
                            </p>
                        )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-600">
                            Password
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-50"
                                onClick={() => setShowPassword(prev => !prev)}
                                tabIndex={-1}
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Forgot password placed below password field */}
                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-[#1e2e4a] hover:text-[#152238] hover:underline transition-colors disabled:opacity-50"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {/* Submit button with clean plain solid navy color */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1e2e4a] hover:bg-[#152238] active:bg-[#0f1a2e] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#1e2e4a] focus:ring-offset-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Signing you in...</span>
                        </>
                    ) : (
                        <span>Sign in</span>
                    )}
                </button>
            </form>

            {/* Footer registration link */}
            <div className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="font-semibold text-[#1e2e4a] hover:text-[#152238] hover:underline transition-all duration-200"
                >
                    Create one
                </Link>
            </div>
        </div>
    )
}

export default Login