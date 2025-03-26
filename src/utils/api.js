import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})

// Interceptador de respostas
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const { status } = error.response
            if (status === 403) {
                localStorage.removeItem('auth-storage')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api