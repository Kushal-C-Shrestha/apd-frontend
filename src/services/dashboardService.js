import api from '@/api'

const unwrap = (response) => response.data?.data ?? response.data?.Data ?? response.data

export const getAdminDashboard = () => 
    api.get('/dashboard/admin').then(unwrap)

export const getStaffDashboard = () => 
    api.get('/dashboard/staff').then(unwrap)