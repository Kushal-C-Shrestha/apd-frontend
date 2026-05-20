import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

let _token = localStorage.getItem('token') || null
let _refreshToken = localStorage.getItem('refreshToken') || null

export const setToken = (token, refreshToken = null) => { 
    _token = token 
    if (token) {
        localStorage.setItem('token', token)
    } else {
        localStorage.removeItem('token')
    }

    if (refreshToken) {
        _refreshToken = refreshToken
        localStorage.setItem('refreshToken', refreshToken)
    } else if (token === null) {
        _refreshToken = null
        localStorage.removeItem('refreshToken')
    }
}

let onRefresh = null
export const registerRefreshCallback = (cb) => { onRefresh = cb }

api.interceptors.request.use((config) => {
    if (_token) config.headers.Authorization = `Bearer ${_token}`
    return config
}, (error) => Promise.reject(error))
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token)
    )
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        // Skip retry if: not a 401, already retried, no refresh token, or the
        // failing request was itself the refresh endpoint (prevents infinite loop)
        const isRefreshEndpoint = original?.url?.includes('/auth/refresh')
        if (
            error.response?.status !== 401 ||
            original._retry ||
            !_refreshToken ||
            isRefreshEndpoint
        ) {
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`
                return api(original)
            })
        }

        original._retry = true
        isRefreshing = true

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh`,
                { refreshToken: _refreshToken },
                { withCredentials: true }
            )
            const newToken = data.accessToken
            const newRefreshToken = data.refreshToken
            setToken(newToken, newRefreshToken)
            onRefresh?.(newToken, newRefreshToken)
            processQueue(null, newToken)
            original.headers.Authorization = `Bearer ${newToken}`
            return api(original)
        } catch (refreshError) {
            processQueue(refreshError, null)
            setToken(null, null)
            onRefresh?.(null, null)
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api
