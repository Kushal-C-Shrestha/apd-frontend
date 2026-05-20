import api from '@/api'

export const searchCustomers = (query = '') =>
    api.get('/customer/search', { params: { query } }).then(r => r.data)

export const getCustomerHistory = (id) =>
    api.get(`/customer/${id}/history`).then(r => r.data)

export const registerCustomer = (data) =>
    api.post('/customer/register', data).then(r => r.data)

export const getAllVehicles = () =>
    api.get('/vehicle/all').then(r => r.data)

export const createVehicle = (data) =>
    api.post('/vehicle', data).then(r => r.data)
