import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home' }} />
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
