import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="user-info"
                options={{
                    presentation: 'modal',
                    title: 'User Info',
                }}
            />
        </Stack>
    );
}
