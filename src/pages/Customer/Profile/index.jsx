import { useState, useEffect } from 'react'
import { User, LoaderCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '@/services/profileService'

const Profile = () => {
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        getProfile()
            .then(data => {
                if (active && data) {
                    setForm({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    })
                }
            })
            .catch(err => {
                toast.error('Failed to load profile.', { position: 'top-center' })
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [])

    const field = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSave = async () => {
        if (!form.fullName || !form.email || !form.phone) {
            toast.error('Full Name, Email, and Phone are required.', { position: 'top-center' })
            return
        }

        setSaving(true)
        try {
            await updateProfile(form)
            toast.success('Profile updated successfully!', { position: 'top-center' })
        } catch (error) {
            toast.error(error?.response?.data?.message ?? 'Failed to update profile.', { position: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
                <LoaderCircle size={20} className="animate-spin" />
                Loading profile...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-8">
                {/* Header section with avatar */}
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold uppercase shrink-0 border-4 border-white shadow-sm ring-1 ring-gray-100">
                        {form.fullName ? form.fullName.split(' ').slice(0, 2).map(n => n[0]).join('') : 'U'}
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{form.fullName || 'User'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                            <User size={14} className="text-gray-400" /> 
                            Customer Account
                        </p>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Form Section */}
                <div>
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {[['Full Name', 'fullName', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Address', 'address', 'text']].map(([label, key, type]) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                                <input 
                                    type={type} 
                                    value={form[key]} 
                                    onChange={e => field(key, e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 hover:bg-gray-100/50" 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-gray-100">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-95 text-white disabled:bg-blue-400 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                    >
                        {saving && <LoaderCircle size={16} className="animate-spin" />}
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile
