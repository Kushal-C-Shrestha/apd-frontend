import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout'
import {
    Login, Register,
    AdminDashboard, AdminStaffs, AdminParts, AdminAppointments, AdminVendors, AdminReviews, AdminNotifications,
    StaffDashboard, StaffCustomers, StaffParts, StaffSales,
    CustomerAppointments, CustomerReviews, CustomerPurchases, CustomerVehicles, CustomerProfile, CustomerParts,
} from '../pages'

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<DashboardLayout />}>
                    {/* Admin Routes */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/staffs" element={<AdminStaffs />} />
                    <Route path="/admin/parts" element={<AdminParts />} />
                    <Route path="/admin/appointments" element={<AdminAppointments />} />
                    <Route path="/admin/vendors" element={<AdminVendors />} />
                    <Route path="/admin/reviews" element={<AdminReviews />} />
                    <Route path="/admin/notifications" element={<AdminNotifications />} />

                    {/* Staff Routes */}
                    <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
                    <Route path="/staff/dashboard" element={<StaffDashboard />} />
                    <Route path="/staff/customers" element={<StaffCustomers />} />
                    <Route path="/staff/parts" element={<StaffParts />} />
                    <Route path="/staff/sales" element={<StaffSales />} />

                    {/* Customer Routes */}
                    <Route path="/customer" element={<Navigate to="/customer/appointments" replace />} />
                    <Route path="/customer/appointments" element={<CustomerAppointments />} />
                    <Route path="/customer/reviews" element={<CustomerReviews />} />
                    <Route path="/customer/purchases" element={<CustomerPurchases />} />
                    <Route path="/customer/vehicles" element={<CustomerVehicles />} />
                    <Route path="/customer/profile" element={<CustomerProfile />} />
                    <Route path="/customer/parts" element={<CustomerParts />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default AppRoutes
