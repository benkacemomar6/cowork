import axios from 'axios'
const baseURL = import.meta.env.VITE_API_URL
const api=axios.create({baseURL});
api.interceptors.request.use((config)=>{
    const token=localStorage.getItem('token')
    if (token){
        config.headers.Authorization='Bearer '+token
    }
    return config
})

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        const isAuthRoute = original?.url?.startsWith('/auth/')

        if (error.response?.status === 401 && !isAuthRoute && !original._retry) {
            original._retry = true
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                try {
                    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
                    localStorage.setItem('token', res.data.token)
                    original.headers.Authorization = 'Bearer ' + res.data.token
                    return api(original)
                } catch (refreshError) {
                    // refresh token itself is invalid/expired — fall through to logout below
                }
            }

            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default api