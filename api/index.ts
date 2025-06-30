import axios from 'axios';

const api = axios.create({
    baseURL: 'https://theroutine-dccgcpdrckgqhahh.canadacentral-01.azurewebsites.net/api',
    // baseURL: 'http://172.20.10.3:5284/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
