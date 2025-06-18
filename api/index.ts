// utils/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.0.107:5284/api', // Replace with API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
