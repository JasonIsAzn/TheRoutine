import { Stack } from 'expo-router';

export default function WorkoutPlanLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create" options={{ title: 'Create Workout Plan' }} />
            <Stack.Screen name="workout-session" options={{ title: 'Today Workout Session' }} />
            <Stack.Screen name="workout-calendar" options={{ title: 'Workout Calendar' }} />
            <Stack.Screen
                name="workout-plan-info"
                options={{
                    presentation: 'modal',
                    title: 'Your Plan',
                }}
            />
            <Stack.Screen
                name="workout-session-info"
                options={{
                    presentation: 'modal',
                    title: 'Session',
                }}
            />
        </Stack>
    );
}
