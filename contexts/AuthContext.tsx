// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, loginWithApple as apiLoginWithApple } from '../api/auth';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    ready: boolean;
    loginWithApple: (appleId: string, email: string, name: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
            setReady(true);
        };
        loadUser();
    }, []);

    const loginWithApple = async (appleId: string, email: string, name: string): Promise<boolean> => {
        try {
            const data = await apiLoginWithApple(appleId, email, name);
            setUser(data);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Apple login failed:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const data = await apiLogin(email, password);
            setUser(data);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const register = async (email: string, password: string, name: string) => {
        const data = await apiRegister(email, password, name);
        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, ready, loginWithApple, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
