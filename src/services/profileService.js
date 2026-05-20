import api from '@/api'

const unwrap = (response) => response.data?.data ?? response.data?.Data ?? response.data

export const getProfile = () =>
    api.get('/profile').then(unwrap)

export const updateProfile = (data) =>
    api.put('/profile', data).then(unwrap)
