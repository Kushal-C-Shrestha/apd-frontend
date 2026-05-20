import api from '@/api'

export const getAllParts = () =>
    api.get('/parts').then(r => r.data)

export const createPart = (data) =>
    api.post('/parts', data).then(r => r.data)

export const updatePart = (id, data) =>
    api.put(`/parts/${id}`, data).then(r => r.data)

export const deletePart = (id) =>
    api.delete(`/parts/${id}`).then(r => r.data)

export const getAllPurchases = () =>
    api.get('/parts/purchases').then(r => r.data)

export const createPurchase = (data) =>
    api.post('/parts/purchases', data).then(r => r.data)