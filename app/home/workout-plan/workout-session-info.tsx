import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchWorkoutSessionById } from '../../../api/workoutSession';

export default function WorkoutSessionInfoModal() {
    const { sessionId } = useLocalSearchParams();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            if (!sessionId) return;
            try {
                const result = await fetchWorkoutSessionById(Number(sessionId));
                setSession(result);
            } catch (err) {
                console.error('Failed to fetch session:', err);
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [sessionId]);

    console.log('WorkoutSessionInfoModal loaded with session:', session);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!session) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Session not found.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold mb-2">{session.label}</Text>
            <Text className="text-gray-700 mb-1">Date: {session.date.split('T')[0]}</Text>
            <Text className="text-gray-700 mb-1">Is Completed: {session.isCompleted ? 'Yes' : 'No'}</Text>
            <Text className="text-gray-700 mb-1">Cycle Day Index: {session.cycleDayIndex}</Text>
            <Text className="text-gray-700 mb-1">Workout Cycle ID: {session.workoutCycleId}</Text>
            <Text className="text-gray-700 mb-4">User ID: {session.userId}</Text>

            <Text className="text-lg font-semibold mb-2">Exercises:</Text>
            {session.exercises.map((ex: any, index: number) => (
                <View key={index} className="mb-4 border-b border-gray-300 pb-2">
                    <Text className="text-base font-semibold">#{index + 1} {ex.name}</Text>
                    <Text className="text-sm text-gray-500">Order: {ex.order}</Text>
                    <Text className="text-sm text-gray-500">
                        Muscles: {ex.muscles.join(', ')}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Base Exercise ID: {ex.baseExerciseId ?? '-'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Weight: {ex.weight ?? '-'} lbs
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Is Optional: {ex.isOptional ? 'Yes' : 'No'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Is Completed: {ex.isCompleted ? 'Yes' : 'No'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Is Skipped: {ex.isSkipped ? 'Yes' : 'No'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Is Deleted: {ex.isDeleted ? 'Yes' : 'No'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Workout Session ID: {ex.workoutSessionId}
                    </Text>
                </View>
            ))}
        </View>
    );
}
