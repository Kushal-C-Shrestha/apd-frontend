import api from '@/api'

export const getAdminNotifications = () =>
    api.get('/notifications/admin').then(r => r.data)

export const getStaffNotifications = () =>
    api.get('/notifications/staff').then(r => r.data)

export const getCustomerNotifications = (userId) =>
    api.get(`/notifications/customer/${userId}`).then(r => r.data)