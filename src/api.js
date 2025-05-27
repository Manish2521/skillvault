import axios from 'axios'

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change to your backend URL if deployed
})

// Set JWT token for authenticated requests
export function setToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api
