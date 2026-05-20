import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks'

const ROLE_HOME = {
    Admin: '/admin/dashboard',
    Staff: '/staff/dashboard',
    Customer: '/customer/appointments',
}

const ProtectedRoute = ({ roles }) => {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
