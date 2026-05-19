import api from '@/api'

const unwrap = (response) => response.data?.data ?? response.data?.Data ?? response.data

export const createSale = (data) =>
    api.post('/sale', data).then(unwrap)

export const getAllSales = () =>
    api.get('/sale').then(unwrap)

export const sendInvoiceEmail = (saleId) =>
    api.post(`/sale/${saleId}/send-invoice`).then(unwrap)

export const getCustomers = () =>
    api.get('/customer/search', {
        params: {
            query: '',
            filter: 'all',
        },
    }).then(unwrap)

export const getCustomerHistory = (userId) =>
    api.get(`/customer/${userId}/history`).then(unwrap)