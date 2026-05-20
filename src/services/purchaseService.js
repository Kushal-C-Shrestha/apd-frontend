import api from '@/api'

export const createPurchase = (data) =>
    api.post('/purchase', data).then(r => r.data)

export const getMyPurchases = (userId) =>
    api.get(`/sale/user/${userId}`).then(r => r.data)