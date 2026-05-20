import api from '@/api'

export const createRequest = (data) =>
    api.post('/request', data).then(r => r.data)

export const getMyRequests = (userId) =>
    api.get(`/request/user/${userId}`).then(r => r.data)

export const getAllRequests = () =>
    api.get('/request').then(r => r.data)

export const updateRequestStatus = (requestId, status) =>
    api.patch(`/request/${requestId}/status`, { status }).then(r => r.data)
