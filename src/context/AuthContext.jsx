import { createContext, useState, useEffect, useCallback } from 'react'
import { setToken, registerRefreshCallback } from '@/api'

export const AuthContext = createContext(null)

function parseUser(token) {
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]))
        return {
            id: decoded.nameid || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null,
            name: decoded.unique_name || decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
            email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
            role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Customer',
        }
    } catch {
        return null
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem('token')
        return savedToken ? parseUser(savedToken) : null
    })

    const logout = useCallback(() => {
        setToken(null, null)
        setUser(null)
        window.location.href = '/login'
    }, [])

    const login = (newToken, newRefreshToken) => {
        setToken(newToken, newRefreshToken)
        setUser(parseUser(newToken))
    }

    useEffect(() => {
        registerRefreshCallback((newToken, newRefreshToken) => {
            if (!newToken) {
                logout()
                return
            }
            setToken(newToken, newRefreshToken)
            setUser(parseUser(newToken))
        })
    }, [logout])

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}