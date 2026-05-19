import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addStaffSchema, editStaffSchema } from '@/schemas/auth'
import {
    getAllStaff,
    registerStaff,
    updateStaff,
    deleteStaff
} from '@/services/staffService'

const EMPTY = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
}

const initials = (name = '') =>
    name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-US', {
              dateStyle: 'medium'
          })
        : '—'

const Staffs = () => {
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null) // 'add' | {id, ...}
    const [saving, setSaving] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors }
    } = useForm({
        resolver: (values, context, options) => {
            const currentSchema =
                modal === 'add' ? addStaffSchema : editStaffSchema

            return zodResolver(currentSchema)(
                values,
                context,
                options
            )
        },
        defaultValues: EMPTY
    })

    const load = () => {
        setLoading(true)

        getAllStaff()
            .then(res =>
                setStaff(Array.isArray(res) ? res : res?.data ?? [])
            )
            .catch(() => toast.error('Failed to load staff.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const openAdd = () => {
        reset(EMPTY)
        setModal('add')
    }

    const openEdit = (s) => {
        reset({
            fullName: s.fullName || '',
            email: s.email || '',
            phone: s.phone || '',
            address: s.address ?? '',
            password: ''
        })

        setModal(s)
    }

    const closeModal = () => {
        setModal(null)
        reset(EMPTY)
    }

    const onSubmit = async (data) => {
        setSaving(true)

        const nameParts = data.fullName.trim().split(' ')

        const payload = {
            ...data,
            firstName: nameParts[0] || '',
            lastName:
                nameParts.length > 1
                    ? nameParts.slice(1).join(' ')
                    : ''
        }

        try {
            if (modal === 'add') {
                const res = await registerStaff(payload)
                const created = res?.data ?? res

                setStaff(prev => [...prev, created])

                toast.success('Staff added.')
            } else {
                const res = await updateStaff(
                    modal.userId,
                    payload
                )

                const updated = res?.data ?? res

                setStaff(prev =>
                    prev.map(x =>
                        x.userId === modal.userId ? updated : x
                    )
                )

                toast.success('Staff updated.')
            }

            closeModal()
        } catch (e) {
            const serverErrors = e.response?.data?.errors

            if (serverErrors) {
                Object.entries(serverErrors).forEach(
                    ([field, message]) => {
                        const camelField =
                            field.charAt(0).toLowerCase() +
                            field.slice(1)

                        setError(camelField, {
                            type: 'server',
                            message: Array.isArray(message)
                                ? message[0]
                                : message
                        })
                    }
                )
            } else {
                const msg =
                    e.response?.data?.message ??
                    'Failed to save.'

                const lowerMsg = msg.toLowerCase()

                if (lowerMsg.includes('email')) {
                    setError('email', {
                        type: 'server',
                        message: msg
                    })
                } else if (lowerMsg.includes('phone')) {
                    setError('phone', {
                        type: 'server',
                        message: msg
                    })
                } else {
                    toast.error(msg)
                }
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this staff member?')) return

        try {
            await deleteStaff(id)

            setStaff(prev =>
                prev.filter(x => x.userId !== id)
            )

            toast.success('Staff removed.')
        } catch {
            toast.error('Failed to delete.')
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                    Staff
                </h1>

                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={15} />
                    Add Staff
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                            {[
                                'Name',
                                'Email',
                                'Phone',
                                'Address',
                                'Joined',
                                ''
                            ].map((h, i) => (
                                <th
                                    key={i}
                                    className="px-5 py-3 text-left font-medium"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-12 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-gray-400">
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : staff.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-12 text-center text-gray-400"
                                >
                                    No staff members found.
                                </td>
                            </tr>
                        ) : (
                            staff.map(s => (
                                <tr
                                    key={s.userId}
                                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                                                {initials(
                                                    s.fullName
                                                )}
                                            </div>

                                            <span className="font-medium text-gray-800">
                                                {s.fullName}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 text-gray-500">
                                        {s.email}
                                    </td>

                                    <td className="px-5 py-3 text-gray-500">
                                        {s.phone}
                                    </td>

                                    <td className="px-5 py-3 text-gray-500">
                                        {s.address || '—'}
                                    </td>

                                    <td className="px-5 py-3 text-gray-400">
                                        {fmt(s.createdAt)}
                                    </td>

                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    openEdit(s)
                                                }
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil
                                                    size={14}
                                                />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        s.userId
                                                    )
                                                }
                                                className="text-gray-400 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2
                                                    size={14}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900">
                                {modal === 'add'
                                    ? 'Add Staff'
                                    : 'Edit Staff'}
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {[
                            ['Full Name', 'fullName', 'text'],
                            ['Email', 'email', 'email'],
                            ['Phone', 'phone', 'tel'],
                            ['Address', 'address', 'text'],
                            ...(modal === 'add'
                                ? [
                                      [
                                          'Password',
                                          'password',
                                          'password'
                                      ]
                                  ]
                                : [])
                        ].map(([label, key, type]) => (
                            <div
                                key={key}
                                className="space-y-1"
                            >
                                <label className="text-xs font-medium text-gray-600">
                                    {label}
                                </label>

                                <input
                                    type={type}
                                    {...register(key)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors[key]
                                            ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400'
                                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                                    }`}
                                />

                                {errors[key] && (
                                    <p className="text-xs text-rose-500 font-medium mt-0.5">
                                        {errors[key].message}
                                    </p>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {saving && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                )}

                                {modal === 'add'
                                    ? 'Add'
                                    : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Staffs