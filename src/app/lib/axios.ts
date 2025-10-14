import axios from 'axios'

const api = axios.create({
    baseURL: 'apiurl',
})

api.interceptors.request.use((config: any) => {
    if (typeof window !== 'undefined') {

        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
    })

    api.interceptors.response.use(
        (res) => res,
        (error) => {
            if (error?.response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }
    )

export default api