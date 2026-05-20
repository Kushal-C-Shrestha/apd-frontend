import api from '@/api'

export const createAppointment = (data) =>
    api.post('/appointment', data).then(r => r.data)

export const getMyAppointments = (userId) =>
    api.get(`/appointment/user/${userId}`).then(r => r.data)

export const getAllAppointments = () =>
    api.get('/appointment').then(r => r.data)

export const rescheduleAppointment = (appointmentId, data) =>
    api.put(`/appointment/${appointmentId}/reschedule`, data).then(r => r.data)

export const cancelAppointment = (appointmentId) =>
    api.put(`/appointment/${appointmentId}/cancel`).then(r => r.data)
