import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
    const { user, ready } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!ready) return;

        if (user) {
            router.replace('/home');
        } else {
            router.replace('/auth');
        }
    }, [ready, user]);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" />
        </View>
    );
}
