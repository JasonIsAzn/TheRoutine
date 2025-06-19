import { Stack } from 'expo-router';

export default function WorkoutPlanLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Gains' }} />
            <Stack.Screen name="create" options={{ title: 'Create Workout Plan' }} />
            <Stack.Screen name="workout-session" options={{ title: 'Today Workout Session' }} />
            <Stack.Screen
                name="workout-plan-info"
                options={{
                    presentation: 'modal',
                    title: 'Your Plan',
                }}
            />
        </Stack>
    );
}
