import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';

export default function WorkoutSessionScreen() {
    const { plan, loading } = useWorkoutPlan();

    if (loading || !plan) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-xl font-bold mb-6">Workout Session (Placeholder)</Text>
            <Pressable
                className="bg-blue-600 px-4 py-2 rounded"
                onPress={() => router.push('/home/workout-plan/workout-plan-info')}
            >
                <Text className="text-white font-semibold">View Full Workout Plan</Text>
            </Pressable>
        </View>
    );
}
