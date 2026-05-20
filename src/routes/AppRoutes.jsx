import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import DashboardLayout from '@/layout/DashboardLayout'
import AuthLayout from '@/layout/AuthLayout'
import { PublicRoute, ProtectedRoute } from '../guards'

import {
    Login,
    Register,

    AdminDashboard,
    AdminPurchases,
    AdminStaffs,
    AdminParts,
    AdminVendors,
    AdminAppointments,
    AdminReviews,
    AdminNotifications,
    AdminReports,
    AdminRequests,
    AdminSales,

    StaffDashboard,
    StaffCustomers,
    StaffParts,
    StaffSales,

    CustomerAppointments,
    CustomerReviews,
    CustomerPurchases,
    CustomerVehicles,
    CustomerProfile,
    CustomerParts,
} from '../pages'

import ForgotPassword from '../pages/ForgotPassword'

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public routes — redirect to home if already logged in */}
                <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />} >
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>
                </Route>

                {/* Protected: Admin only */}
                <Route element={<ProtectedRoute roles={['Admin']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/purchases" element={<AdminPurchases />} />
                        <Route path="/admin/sales" element={<AdminSales />} />
                        <Route path="/admin/reports" element={<AdminReports />} />
                        <Route path="/admin/staffs" element={<AdminStaffs />} />
                        <Route path="/admin/parts" element={<AdminParts />} />
                        <Route path="/admin/appointments" element={<AdminAppointments />} />
                        <Route path="/admin/requests" element={<AdminRequests />} />
                        <Route path="/admin/vendors" element={<AdminVendors />} />
                        <Route path="/admin/reviews" element={<AdminReviews />} />
                        <Route path="/admin/notifications" element={<AdminNotifications />} />
                    </Route>
                </Route>

                {/* Protected: Staff only */}
                <Route element={<ProtectedRoute roles={['Staff']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
                        <Route path="/staff/dashboard" element={<StaffDashboard />} />
                        <Route path="/staff/customers" element={<StaffCustomers />} />
                        <Route path="/staff/parts" element={<StaffParts />} />
                        <Route path="/staff/sales" element={<StaffSales />} />
                    </Route>
                </Route>

                {/* Protected: Customer only */}
                <Route element={<ProtectedRoute roles={['Customer']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/customer" element={<Navigate to="/customer/appointments" replace />} />
                        <Route path="/customer/appointments" element={<CustomerAppointments />} />
                        <Route path="/customer/reviews" element={<CustomerReviews />} />
                        <Route path="/customer/purchases" element={<CustomerPurchases />} />
                        <Route path="/customer/vehicles" element={<CustomerVehicles />} />
                        <Route path="/customer/profile" element={<CustomerProfile />} />
                        <Route path="/customer/parts" element={<CustomerParts />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router >
    )
}

export default AppRoutes
