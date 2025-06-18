import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function UserInfoModal() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/auth');
    };

    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <Text className="text-2xl font-bold mb-6 text-center">User Info</Text>

            {user ? (
                <View className="mb-6">
                    <Text className="text-gray-700 text-base">User ID: {user.id}</Text>
                    <Text className="text-gray-700 text-base">Name: {user.name}</Text>
                    <Text className="text-gray-700 text-base">Email: {user.email}</Text>
                </View>
            ) : (
                <Text className="text-center text-gray-500 mb-6">Not logged in.</Text>
            )}

            <Pressable
                onPress={handleLogout}
                className="bg-red-500 px-4 py-3 rounded mb-4"
            >
                <Text className="text-white text-center font-semibold">Log Out</Text>
            </Pressable>

            <Pressable
                onPress={() => router.back()}
                className="px-4 py-2 bg-gray-200 rounded"
            >
                <Text className="text-center text-black">Close</Text>
            </Pressable>
        </View>
    );
}
