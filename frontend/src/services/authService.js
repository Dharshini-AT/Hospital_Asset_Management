import api from './api';
const login=async(email,password)=>{const r=await api.post('/auth/login',{email,password});return r.data?.data||r.data};
const getCurrentUser=async()=>{const r=await api.get('/auth/me');return r.data?.data||r.data};
const authService={login,getCurrentUser};export default authService;
