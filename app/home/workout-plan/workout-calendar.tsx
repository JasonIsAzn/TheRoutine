import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { fetchAllWorkoutSessions } from '../../../api/workoutSession';
import { fetchAllWorkoutPlans } from '../../../api/workoutPlan';
import { useAuth } from '../../../contexts/AuthContext';

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const [sessionsResult, plansResult] = await Promise.all([
                    fetchAllWorkoutSessions(user.id),
                    fetchAllWorkoutPlans(user.id),
                ]);
                setSessions(sessionsResult);
                setPlans(plansResult);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);


    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getSessionForDate = (dateStr: string) => {
        return sessions.find(s => s.date.startsWith(dateStr));
    };

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        const dateStr = dayDate.toISOString().split('T')[0];
        const session = getSessionForDate(dateStr);
        const isCompleted = session?.isCompleted;

        days.push(
            <Pressable
                key={i}
                onPress={() => {
                    if (session) {
                        router.push({
                            pathname: '/home/workout-plan/workout-session-info',
                            params: { sessionId: session.id },
                        });
                    }
                }}
                className={`w-12 h-12 m-1 justify-center items-center rounded ${isCompleted ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
            >
                <Text>{i}</Text>
            </Pressable>
        );
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4">
            <Text className="text-xl font-bold mb-4">Your Sessions</Text>
            <View className="flex-row flex-wrap">{days}</View>

            <Text className="text-xl font-bold mt-6 mb-2">Workout Plan History</Text>
            {plans.map((plan) => (
                <View key={plan.id} className="mb-2">
                    <Text className="font-semibold">{plan.name}</Text>
                    <Text className="text-sm text-gray-700">
                        {new Date(plan.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}{" "}
                        —{" "}
                        {plan.endedAt
                            ? new Date(plan.endedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : 'Present'}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}
