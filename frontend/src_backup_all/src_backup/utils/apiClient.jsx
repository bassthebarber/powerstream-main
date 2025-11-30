import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})
export default api


