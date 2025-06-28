import axios from 'axios';

const api = axios.create({
    baseURL: 'https://theroutine-dccgcpdrckgqhahh.canadacentral-01.azurewebsites.net/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
