import api from '@/api'

export const createReview = (data) =>
    api.post('/review', data).then(r => r.data)

export const getAllReviews = () =>
    api.get('/review').then(r => r.data)

export const getMyReviews = (userId) =>
    api.get(`/review/user/${userId}`).then(r => r.data)
