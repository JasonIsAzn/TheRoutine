import api from './index';

export const pingServer = async () => {
    const response = await api.get('/healthcheck/ping');
    return response.data;
};