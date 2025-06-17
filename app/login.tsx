import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
    const router = useRouter();
    const { login, register } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            if (isRegistering) {
                await register(email, password, name);
            } else {
                const success = await login(email, password);
                if (!success) {
                    setError('Invalid email or password');
                    return;
                }
            }
            router.replace('/home/index');
        } catch (err) {
            console.error(err);
            setError('Something went wrong.');
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
            </Text>

            {isRegistering && (
                <>
                    <Text className="mb-1 text-black dark:text-white">Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded px-4 py-2 text-black dark:text-white mb-3"
                        placeholder="Your name"
                        placeholderTextColor="#aaa"
                        value={name}
                        onChangeText={setName}
                    />
                </>
            )}

            <Text className="mb-1 text-black dark:text-white">Email</Text>
            <TextInput
                className="border border-gray-300 rounded px-4 py-2 text-black dark:text-white mb-3"
                placeholder="Enter email"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <Text className="mb-1 text-black dark:text-white">Password</Text>
            <TextInput
                className="border border-gray-300 rounded px-4 py-2 text-black dark:text-white mb-4"
                placeholder="Enter password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

            <Pressable
                onPress={handleSubmit}
                className="bg-blue-600 px-4 py-2 rounded mb-4"
            >
                <Text className="text-white text-center font-semibold">
                    {isRegistering ? 'Register' : 'Login'}
                </Text>
            </Pressable>

            <Pressable onPress={() => setIsRegistering((prev) => !prev)}>
                <Text className="text-blue-600 text-center">
                    {isRegistering
                        ? 'Already have an account? Login'
                        : 'No account? Register'}
                </Text>
            </Pressable>
        </View>
    );
}
