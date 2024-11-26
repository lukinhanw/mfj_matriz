import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Interceptador de respostas
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const { status } = error.response
            if (status === 403) {
                window.location.href = '/login'
                // localStorage.clear()
            }
        }
        return Promise.reject(error)
    }
)

export default api