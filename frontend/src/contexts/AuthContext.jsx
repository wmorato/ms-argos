import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('argos_user')
        const token = localStorage.getItem('argos_token')
        if (stored && token) {
            try { setUser(JSON.parse(stored)) } catch { logout() }
        }
        setLoading(false)
    }, [])

    function login(token, userData) {
        localStorage.setItem('argos_token', token)
        localStorage.setItem('argos_user', JSON.stringify(userData))
        setUser(userData)
    }

    function logout() {
        localStorage.removeItem('argos_token')
        localStorage.removeItem('argos_user')
        setUser(null)
    }

    const isAdmin = user?.role === 'admin' || user?.role === 'dev'

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
