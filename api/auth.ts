// api/auth.ts
import api from './index';

export const register = async (email: string, password: string, name: string) => {
    const response = await api.post('/userapi/register', { email, password, name });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/userapi/login', { email, password });
    return response.data;
};

export const loginWithApple = async (appleId: string, email: string, name: string) => {
    const response = await api.post('/userapi/apple-login', { appleId, email, name, });
    return response.data;
};