import { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
    const router = useRouter();
    const { loginWithApple } = useAuth();
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

            const success = await loginWithApple(appleId, email, name);
            if (success) {
                router.replace('/home');
            } else {
                setError('Apple login failed. Please try again.');
            }
        } catch (e: any) {
            if (e.code !== 'ERR_CANCELED') {
                console.error(e);
                setError('Apple login failed. Please try again.');
            }
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
                Welcome
            </Text>

            {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : null}

            {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={5}
                    style={{ width: '100%', height: 44 }}
                    onPress={handleAppleLogin}
                />
            )}
        </View>
    );
}
