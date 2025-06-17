import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
    const { user, logout } = useAuth();

    return (
        <View className="flex-1 justify-center items-center px-6 bg-white dark:bg-black">
            <Text className="text-2xl font-bold mb-4 text-black dark:text-white">Welcome 👋</Text>

            {user ? (
                <View className="mb-4">
                    <Text className="text-lg text-black dark:text-white">Logged in as:</Text>
                    <Text className="text-md mt-1 text-gray-700 dark:text-gray-300">
                        Name: {user.name}
                    </Text>
                    <Text className="text-md text-gray-700 dark:text-gray-300">
                        Email: {user.email}
                    </Text>
                </View>
            ) : (
                <Text className="text-red-500">No user logged in</Text>
            )}

            <Button title="Logout" onPress={logout} />
        </View>
    );
}
