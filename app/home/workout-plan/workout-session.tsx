import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import {
    fetchActiveWorkoutCycle,
    createWorkoutCycle
} from '../../../api/workoutCycle';
import { router } from 'expo-router';

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const { plan, loading: planLoading } = useWorkoutPlan();

    const [cycle, setCycle] = useState<any>(null);
    const [loadingCycle, setLoadingCycle] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            if (!user || !plan) return;

            try {
                const existing = await fetchActiveWorkoutCycle(user.id);
                setCycle(existing);
            } catch {
                await createWorkoutCycle({
                    userId: user.id,
                    workoutPlanId: plan.planId,
                    startDate: new Date().toISOString(),
                });

                const newCycle = await fetchActiveWorkoutCycle(user.id);
                setCycle(newCycle);
            } finally {
                setLoadingCycle(false);
            }
        };

        if (!planLoading && plan) {
            initialize();
        }
    }, [planLoading, plan]);

    if (planLoading || loadingCycle || !plan || !cycle) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" />
                <Text className="mt-4">Loading Workout Cycle...</Text>
            </View>
        );
    }

    // Build label lookup from WorkoutPlan
    const labelMap = new Map<number, string>();
    plan.workoutDays.forEach((day: { order: number; label: string }) => {
        labelMap.set(day.order, day.label);
    });

    // Show only the remaining days in the cycle
    const fullWeek = cycle.dayOrderMap.map((dayIndex: number) => ({
        label: labelMap.get(dayIndex) || 'Rest Day',
        weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex],
    }));

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-6">
            <Text className="text-xl font-bold mb-4 text-center">Your Current Cycle</Text>

            {fullWeek.map((day: { label: string; weekday: string }, idx: number) => (
                <View key={idx} className="mb-4">
                    <Text className="text-sm text-gray-500">{day.weekday}</Text>
                    <Text className="text-base font-semibold text-black">{day.label}</Text>
                </View>
            ))}

            <View className="mt-8 mb-12">
                <Pressable
                    className="bg-blue-600 px-4 py-3 rounded"
                    onPress={() => router.push('/home/workout-plan/workout-plan-info')}
                >
                    <Text className="text-white text-center font-semibold">
                        View Full Workout Plan
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
