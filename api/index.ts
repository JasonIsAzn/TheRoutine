// utils/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.99:5284/api', // Replace with your API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
