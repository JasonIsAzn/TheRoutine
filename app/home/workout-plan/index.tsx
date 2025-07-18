import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { ActivityIndicator, Text, View } from 'react-native';

export default function WorkoutPlanIndex() {
    const { plan, loading } = useWorkoutPlan();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (plan) {
                router.replace('/home/workout-plan/workout-session');
            } else {
                router.replace('/home/workout-plan/create');
            }
        }
    }, [loading, plan]);

    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
            <Text>Loading plan...</Text>
        </View>
    );
}
