import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/schemas/auth'
import api from '@/api'
import useAuth from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const Register = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const { data: responseData } = await api.post('/auth/register', {
                fullName: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                password: data.password
            })

            if (responseData.success) {
                const token = responseData.data?.token
                const refreshToken = responseData.data?.refreshToken
                if (token) {
                    login(token, refreshToken)
                    const firstName = (data.name ?? '').trim().split(' ')[0]
                    toast.success(`Welcome to ApexDrive, ${firstName}!`)
                    navigate('/customer/appointments')
                } else {
                    toast.success('Account created successfully! Please login.')
                    navigate('/login')
                }
            } else {
                toast.error(responseData.message || 'Registration failed')
            }
        } catch (error) {
            console.error('Registration error:', error)
            const serverErrors = error.response?.data?.errors
            if (serverErrors) {
                Object.entries(serverErrors).forEach(([field, message]) => {
                    setError(field, { type: 'server', message })
                })
            } else {
                const msg = error.response?.data?.message || 'Email or phone already exists'
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Create an account
                </h2>
                <p className="text-sm text-slate-500">
                    Get started with ApexDrive and manage your vehicles seamlessly.
                </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name (Spans 2 columns on desktop) */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label htmlFor="name" className="text-xs font-semibold text-slate-600">
                            Full Name
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                            <input
                                id="name"
                                type="text"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your name"
                                autoComplete="name"
                                disabled={loading}
                                {...register('name')}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
                            Email Address
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={16} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-semibold text-slate-600">
                            Phone Number
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Phone size={16} />
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your phone number"
                                autoComplete="tel"
                                disabled={loading}
                                {...register('phone')}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Address (Spans 2 columns on desktop) */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label htmlFor="address" className="text-xs font-semibold text-slate-600">
                            Address
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <MapPin size={16} />
                            </div>
                            <input
                                id="address"
                                type="text"
                                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Enter your address"
                                autoComplete="street-address"
                                disabled={loading}
                                {...register('address')}
                            />
                        </div>
                        {errors.address && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.address.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
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
                                autoComplete="new-password"
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

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600">
                            Confirm Password
                        </label>
                        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#2b4c7e] focus-within:ring-1 focus-within:ring-[#2b4c7e]">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                disabled={loading}
                                {...register('confirmPassword')}
                            />
                            <button
                                type="button"
                                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-50"
                                onClick={() => setShowConfirm(prev => !prev)}
                                tabIndex={-1}
                                disabled={loading}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.confirmPassword.message}
                            </p>
                        )}
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
                            <span>Creating your account...</span>
                        </>
                    ) : (
                        <span>Create account</span>
                    )}
                </button>
            </form>

            {/* Footer login link */}
            <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="font-semibold text-[#1e2e4a] hover:text-[#152238] hover:underline transition-all duration-200"
                >
                    Sign in
                </Link>
            </div>
        </div>
    )
}

export default Register