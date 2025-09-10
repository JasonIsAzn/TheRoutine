import { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
    const router = useRouter();
    const { login, register, loginWithApple } = useAuth();

    const [method, setMethod] = useState<'apple' | 'email'>('apple');
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const appleId = credential.user;
            const email = credential.email ?? `${appleId}@apple-user.fake`;
            const name = credential.fullName?.givenName ?? 'Apple User';

            await loginWithApple(appleId, email, name);
            router.replace('/home/workout-plan');
        } catch (e: any) {
            if (e.code === 'ERR_CANCELED') return;
            console.error(e);

            if (e.response?.data?.message) {
                setError(e.response.data.message);
            } else {
                setError('Apple login failed. Please try again.');
            }
        }
    };

    const handleEmailSubmit = async () => {
        try {
            if (isRegistering) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            router.replace('/home/workout-plan');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong.');
            }
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
                Welcome
            </Text>

            {/* Tab Switcher */}
            <View className="flex-row justify-center mb-6">
                <Pressable onPress={() => setMethod('apple')} className={`px-4 py-2 rounded-l-full ${method === 'apple' ? 'bg-black' : 'bg-gray-200'}`}>
                    <Text className={`text-sm ${method === 'apple' ? 'text-white' : 'text-black'}`}>Apple</Text>
                </Pressable>
                <Pressable onPress={() => setMethod('email')} className={`px-4 py-2 rounded-r-full ${method === 'email' ? 'bg-black' : 'bg-gray-200'}`}>
                    <Text className={`text-sm ${method === 'email' ? 'text-white' : 'text-black'}`}>Email</Text>
                </Pressable>
            </View>

            {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : null}

            {method === 'apple' && Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={5}
                    style={{ width: '100%', height: 48 }}
                    onPress={handleAppleLogin}
                />
            )}

            {method === 'email' && (
                <View>
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

                    <Pressable
                        onPress={handleEmailSubmit}
                        className="bg-blue-600 px-4 py-3 rounded mb-3 active:opacity-80"
                    >
                        <Text className="text-white text-center font-semibold">
                            {isRegistering ? 'Register' : 'Login'}
                        </Text>
                    </Pressable>

                    <Pressable onPress={() => setIsRegistering((prev) => !prev)}>
                        <Text className="text-blue-600 text-center">
                            {isRegistering ? 'Already have an account? Login' : 'Don’t have an account? Register'}
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}
