import api from '@/api'

export const getAllStaff = () =>
    api.get('/staff').then(r => r.data)

export const registerStaff = (data) =>
    api.post('/staff', data).then(r => r.data)

export const updateStaff = (userId, data) =>
    api.put(`/staff/${userId}`, data).then(r => r.data)

export const deleteStaff = (userId) =>
    api.delete(`/staff/${userId}`).then(r => r.data)
