import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL;
// Create an Axios instance
const api = axios.create({
  baseURL: `${backendUrl}/api`, 
})

// Set JWT token for authenticated requests
export function setToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api
