import {
    AlertTriangle,
    Bell,
    CalendarDays,
    Car,
    CreditCard,
    ShoppingCart,
    Star,
    UserCircle,
    Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
    NOTIFICATION_ROUTES,
} from '@/data/notifications'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks'
import { getAdminNotifications, getStaffNotifications, getCustomerNotifications } from '@/services/notificationService'

const ROLE_COPY = {
    Admin: {
        eyebrow: 'Operations alerts',
        description: 'Track stock, payments, bookings, and service activity across the workshop.',
    },
    Staff: {
        eyebrow: 'Front desk updates',
        description: 'Stay on top of customer arrivals, credits, parts, and workshop updates.',
    },
    Customer: {
        eyebrow: 'Account updates',
        description: 'See booking confirmations, order updates, reminders, and account activity.',
    },
}

const TYPE_META = {
    inventory: {
        icon: AlertTriangle,
        accent: 'bg-rose-50 text-rose-500',
    },
    payment: {
        icon: CreditCard,
        accent: 'bg-amber-50 text-amber-500',
    },
    appointment: {
        icon: CalendarDays,
        accent: 'bg-sky-50 text-sky-500',
    },
    review: {
        icon: Star,
        accent: 'bg-violet-50 text-violet-500',
    },
    service: {
        icon: Wrench,
        accent: 'bg-emerald-50 text-emerald-500',
    },
    vehicle: {
        icon: Car,
        accent: 'bg-blue-50 text-blue-500',
    },
    purchase: {
        icon: ShoppingCart,
        accent: 'bg-indigo-50 text-indigo-500',
    },
    account: {
        icon: UserCircle,
        accent: 'bg-slate-100 text-slate-500',
    },
}

function NotificationItem({ notification, compact = false }) {
    const meta = TYPE_META[notification.type] ?? { icon: Bell, accent: 'bg-slate-100 text-slate-500' }
    const Icon = meta.icon

    if (compact) {
        return (
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors duration-150">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.accent}`}>
                    <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">{notification.title}</p>
                        {notification.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{notification.time}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors duration-150">
            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.accent}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{notification.title}</p>
                            {notification.unread && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                                    New
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">{notification.time}</span>
                </div>
            </div>
        </div>
    )
}

function NotificationPreview({ role = 'Admin', notifications = [], unreadCount = 0 }) {
    const navigate = useNavigate()
    const recentNotifications = notifications.slice(0, 3)
    const notificationRoute = NOTIFICATION_ROUTES[role]

    const openNotifications = () => navigate(notificationRoute)

    return (
        <div className="w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
                <div>
                    <p className="text-sm font-semibold text-slate-900">Recent notifications</p>
                    <p className="text-xs text-slate-500">
                        {unreadCount > 0 ? `${unreadCount} unread updates` : 'No unread updates'}
                    </p>
                </div>
                {notificationRoute && (
                    <button
                        type="button"
                        onClick={openNotifications}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-50"
                    >
                        View all
                    </button>
                )}
            </div>

            <div className="space-y-1">
                {recentNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                        No notifications yet.
                    </div>
                ) : (
                    recentNotifications.map(notification => (
                        <button
                            key={notification.id}
                            type="button"
                            onClick={notificationRoute ? openNotifications : undefined}
                            className={`block w-full text-left ${!notificationRoute ? 'cursor-default' : ''}`}
                        >
                            <NotificationItem notification={notification} compact />
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

const NotificationPage = ({ role = 'Admin' }) => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const copy = ROLE_COPY[role] ?? ROLE_COPY.Admin

    useEffect(() => {
        let active = true
        const fetchNotifications = async () => {
            try {
                let res;
                if (role === 'Admin') {
                    res = await getAdminNotifications()
                } else if (role === 'Staff') {
                    res = await getStaffNotifications()
                } else if (role === 'Customer' && user?.id) {
                    res = await getCustomerNotifications(user.id)
                }
                if (!active) return
                if (res) {
                    setNotifications(res.notifications ?? [])
                    setUnreadCount(res.unreadCount ?? 0)
                }
            } catch (err) {
                console.error("Failed to fetch notifications page:", err)
            } finally {
                if (active) setLoading(false)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000)

        return () => {
            active = false
            clearInterval(interval)
        }
    }, [role, user?.id])

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">{copy.eyebrow}</p>
                <h1 className="mt-2 text-xl font-semibold text-gray-900">Notifications</h1>
                <p className="mt-1 text-sm text-gray-500">{copy.description}</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-sm text-gray-500">
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-gray-500 text-sm">
                    Everything is quiet. No notifications found.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {notifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
            )}
        </div>
    )
}

export { NotificationPreview }
export default NotificationPage