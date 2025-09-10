import axios from 'axios';

const api = axios.create({
    baseURL: 'https://theroutine-production.up.railway.app/api',
    // baseURL: 'http://192.168.1.11:5284/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
