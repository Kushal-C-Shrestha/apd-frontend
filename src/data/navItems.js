import { BarChart3, Bell, Building2, CalendarDays, Car, ClipboardList, LayoutDashboard, Package, Receipt, ShoppingBag, ShoppingCart, Star, UserCircle, Users, Wrench } from 'lucide-react';

const NAV_GROUPS = {
    Admin: [
        {
            group: 'Overview',
            items: [
                { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
            ],
        },
        {
            group: 'Management',
            items: [
                { label: 'Staffs', path: '/admin/staffs', icon: Users },
                { label: 'Parts', path: '/admin/parts', icon: Wrench },
                { label: 'Purchases', path: '/admin/purchases', icon: ShoppingCart },
                { label: 'Vendors', path: '/admin/vendors', icon: Building2 },
            ],
        },
        {
            group: 'Operations',
            items: [
                { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
                { label: 'Sales', path: '/admin/sales', icon: Receipt },
                { label: 'Part Requests', path: '/admin/requests', icon: ClipboardList },
                { label: 'Reviews', path: '/admin/reviews', icon: Star },
                { label: 'Notifications', path: '/admin/notifications', icon: Bell },
            ],
        },
    ],
    Staff: [
        {
            group: 'Overview',
            items: [
                { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
                { label: 'Reports', path: '/staff/reports', icon: BarChart3 },
            ],
        },
        {
            group: 'Customers',
            items: [
                { label: 'Customers', path: '/staff/customers', icon: Users },
                { label: 'Vehicles', path: '/staff/vehicles', icon: Car },
            ],
        },
        {
            group: 'Transactions',
            items: [
                { label: 'Parts', path: '/staff/parts', icon: Wrench },
                { label: 'Sales', path: '/staff/sales', icon: Receipt },
            ],
        },
    ],
    Customer: [
        {
            group: 'Activity',
            items: [
                { label: 'Appointments', path: '/customer/appointments', icon: CalendarDays },
            ],
        },
        {
            group: 'My Garage',
            items: [
                { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
                { label: 'My Purchases', path: '/customer/purchases', icon: ShoppingBag },
                { label: 'Parts', path: '/customer/parts', icon: Package },
                { label: 'Reviews', path: '/customer/reviews', icon: Star },
            ],
        },
        {
            group: 'Account',
            items: [
                { label: 'Notifications', path: '/customer/notifications', icon: Bell },
                { label: 'Profile', path: '/customer/profile', icon: UserCircle },
            ],
        },
    ],
}

export { NAV_GROUPS }