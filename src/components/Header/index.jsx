import { Menu, CircleUser, Bell } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NotificationPreview } from '@/components/NotificationCenter'
import { NOTIFICATION_ROUTES } from '@/data/notifications'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks'
import { getAdminNotifications, getStaffNotifications, getCustomerNotifications } from '@/services/notificationService'

const pageTitles = {
    dashboard: 'Dashboard',
    staffs: 'Staff Management',
    parts: 'Parts Management',
    appointments: 'Appointments',
    vendors: 'Vendors',
    reviews: 'Reviews',
    notifications: 'Notifications',
    reports: 'Reports',
    customers: 'Customers',
    sales: 'Sales',
    vehicles: 'My Vehicles',
    purchases: 'Purchases',
    profile: 'My Profile',
}

function getPageTitle(pathname) {
    const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
    return pageTitles[segment] ?? (segment.charAt(0).toUpperCase() + segment.slice(1))
}

const Header = ({ role = 'Admin', collapsed, onToggle }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const title = getPageTitle(location.pathname)
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

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
                console.error("Failed to fetch notifications in Header:", err)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000)

        return () => {
            active = false
            clearInterval(interval)
        }
    }, [role, user?.id])

    const notificationRoute = NOTIFICATION_ROUTES[role] ?? NOTIFICATION_ROUTES.Admin
    const unreadLabel = unreadCount > 9 ? '9+' : unreadCount

    return (
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0 shadow-sm">
            {/* Left: burger + title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!collapsed}
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-base font-semibold text-gray-800">{title}</h1>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-4">
                <div className="group relative">
                    <button
                        onClick={() => navigate(notificationRoute)}
                        className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-gray-800 transition-colors duration-150"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                                {unreadLabel}
                            </span>
                        )}
                    </button>

                    <div className="invisible absolute right-0 top-full z-50 pt-3 opacity-0 translate-y-2 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <NotificationPreview role={role} notifications={notifications} unreadCount={unreadCount} />
                    </div>
                </div>

                <button
                    onClick={() => navigate('/customer/profile')}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-gray-800 transition-colors duration-150"
                    title="Profile"
                >
                    <CircleUser size={24} />
                </button>
            </div>
        </header>
    )
}

export default Header
