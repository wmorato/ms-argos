import axios from 'axios'

const api = axios.create({
    baseURL: '/argos/api',
    timeout: 30000,
})
console.log('Argos Hub Build: 2026-03-09 01:57')

// Injeta token JWT em toda requisição
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('argos_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Redireciona para login se 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('argos_token')
            localStorage.removeItem('argos_user')
            window.location.href = '/argos/'
        }
        return Promise.reject(err)
    }
)

export default api
