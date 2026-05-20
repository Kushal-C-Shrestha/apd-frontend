import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks'

const ROLE_HOME = {
    Admin: '/admin/dashboard',
    Staff: '/staff/dashboard',
    Customer: '/customer/appointments',
}

const PublicRoute = () => {
    const { user } = useAuth()

    if (user) {
        return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
    }

    return <Outlet />
}

export default PublicRoute
