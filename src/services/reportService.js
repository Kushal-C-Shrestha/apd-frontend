import api from '@/api'

const unwrap = (response) => response.data?.data ?? response.data?.Data ?? response.data

export const getFinancialReport = (timeframe) =>
    api.get('/reports/financial', { params: { timeframe } }).then(unwrap)

export const getCustomerReports = () =>
    api.get('/reports/customers').then(unwrap)