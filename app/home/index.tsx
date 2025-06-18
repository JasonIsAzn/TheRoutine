import { View, Text, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/auth');
    };

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold mb-4">The Routine</Text>

            {/* Debug Info */}
            {user && (
                <View className="mb-6">
                    <Text className="text-gray-700 text-sm">User ID: {user.id}</Text>
                    <Text className="text-gray-700 text-sm">Name: {user.name}</Text>
                    <Text className="text-gray-700 text-sm">Email: {user.email}</Text>
                </View>
            )}

            {/* Navigation Links */}
            <Link href="/home/workout-plan">🏋️ gains</Link>
            <Link href="/home/body-log">📷 thiccness log</Link>
            <Link href="/home/performance">📊 PRs</Link>
            <Link href="/home/diet-tracker">🍽️ big back</Link>
            <Link href="/home/supplement-tracker">💊 roids</Link>
            <Link href="/home/progress-pictures">🪞 glow up</Link>

            {/* Logout Button */}
            <Pressable
                onPress={handleLogout}
                className="mt-8 bg-red-500 px-4 py-3 rounded"
            >
                <Text className="text-white text-center font-semibold">Log Out</Text>
            </Pressable>
        </View>
    );
}
