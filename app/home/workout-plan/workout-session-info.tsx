import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchWorkoutSessionById } from '../../../api/workoutSession';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

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

    if (process.env.NODE_ENV === 'development') {
        console.log('WorkoutSessionInfoModal loaded with session:', session);
    }

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
        <View className="flex-1 bg-background p-5 mt-4">
            <Text className="text-2xl font-bold">
                {new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </Text>
            <Text className="text-gray text-lg mb-8">{session.label}</Text>

            {session.exercises.map((exercise: any) => (
                <View key={exercise.id} className="flex-row items-center mb-8 ">
                    <View className='flex-row items-center'>
                        <View className="flex-1 flex-row items-center gap-2" >
                            <View
                                className={`items-center justify-center h-7 w-7 rounded-full ${exercise.isCompleted
                                    ? 'bg-primary'
                                    : 'bg-background border-2 border-gray/40'
                                    }`}
                            >
                                {exercise.isCompleted && (
                                    <FontAwesomeIcon icon={['fas', 'check']} size={16} color="#fff" />
                                )}
                                {exercise.isSkipped && (
                                    <FontAwesomeIcon icon={['fas', 'ban']} size={16} color="#808080" />
                                )}
                            </View>

                            <View>
                                <Text
                                    className={`text-lg font-semibold ${exercise.isSkipped && 'line-through'
                                        }`}
                                >
                                    {exercise.name}
                                </Text>
                                <Text>{"60lbs"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ))}



        </View>
    );
}


//  <Text className="text-lg font-semibold mb-2">Exercises:</Text>
//     {session.exercises.map((ex: any, index: number) => (
//         <View key={index} className="mb-4 border-b border-gray-300 pb-2">
//             <Text className="text-base font-semibold">#{index + 1} {ex.name}</Text>
//             <Text className="text-sm text-gray-500">Order: {ex.order}</Text>
//             <Text className="text-sm text-gray-500">
//                 Muscles: {ex.muscles.join(', ')}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Base Exercise ID: {ex.baseExerciseId ?? '-'}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Weight: {ex.weight ?? '-'} lbs
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Is Optional: {ex.isOptional ? 'Yes' : 'No'}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Is Completed: {ex.isCompleted ? 'Yes' : 'No'}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Is Skipped: {ex.isSkipped ? 'Yes' : 'No'}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Is Deleted: {ex.isDeleted ? 'Yes' : 'No'}
//             </Text>
//             <Text className="text-sm text-gray-500">
//                 Workout Session ID: {ex.workoutSessionId}
//             </Text>
//         </View>
//     ))}