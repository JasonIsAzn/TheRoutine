import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import {
    fetchActiveWorkoutCycle,
    createWorkoutCycle
} from '../../../api/workoutCycle';
import { router } from 'expo-router';
import {
    fetchWorkoutSessionByDate,
    createWorkoutSession
} from '../../../api/workoutSession';

import {
    fetchSessionExercises,
    toggleCompleteExercise,
    toggleSkipExercise,
    addSessionExercise,
    softDeleteExercise
} from '../../../api/workoutSessionExercise';

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const { plan, loading: planLoading } = useWorkoutPlan();

    const [cycle, setCycle] = useState<any>(null);
    const [loadingCycle, setLoadingCycle] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loadingSession, setLoadingSession] = useState(true);


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

    useEffect(() => {
        const initTodaySession = async () => {
            console.log('Initializing today\'s session...');
            console.log('User:', user);
            console.log('Cycle:', cycle);
            if (!user || !cycle) return;

            const today = new Date().toISOString().split('T')[0]; // e.g. "2024-06-20"
            const todayDate = new Date();
            const todayWeekdayIndex = todayDate.getDay(); // Sunday = 0, Monday = 1, ...
            const cycleDayIndex = cycle.dayOrderMap.findIndex((d: number) => d === todayWeekdayIndex);

            if (cycleDayIndex === -1) {
                console.warn("Today is not part of the current cycle's DayOrderMap.");
                return;
            }

            try {
                const result = await fetchWorkoutSessionByDate(user.id, today);
                console.log('Fetched session for today:', result);
                setSession(result);
                const ex = await fetchSessionExercises(result.id);
                setExercises(ex);
            } catch {
                const created = await createWorkoutSession({
                    userId: user.id,
                    workoutCycleId: cycle.id,
                    cycleDayIndex,
                    date: today
                });
                console.log('Created new workout session:', created);
                const newSession = await fetchWorkoutSessionByDate(user.id, today);
                console.log('Created new session:', newSession);
                setSession(newSession);
                const ex = await fetchSessionExercises(newSession.id);
                setExercises(ex);
            } finally {
                setLoadingSession(false);
            }
        };

        if (!loadingCycle && cycle) {
            initTodaySession();
        }
    }, [loadingCycle, cycle]);


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

    const handleToggleComplete = async (exerciseId: number) => {
        await toggleCompleteExercise(exerciseId);
        const updated = await fetchSessionExercises(session.id);
        setExercises(updated);
    };

    const handleToggleSkip = async (exerciseId: number) => {
        await toggleSkipExercise(exerciseId);
        const updated = await fetchSessionExercises(session.id);
        setExercises(updated);
    };

    const handleSoftDelete = async (exerciseId: number) => {
        await softDeleteExercise(exerciseId);
        const updated = await fetchSessionExercises(session.id);
        setExercises(updated);
    };

    const handleAddExercise = async () => {
        const newExercise = {
            workoutSessionId: session.id,
            name: 'New Exercise',
            muscles: [''],
            order: exercises.length,
            isOptional: true,
            isCompleted: false,
            isSkipped: false,
            isDeleted: false,
            sets: 0,
            reps: 0,
            weight: null
        };
        await addSessionExercise(newExercise);
        const updated = await fetchSessionExercises(session.id);
        setExercises(updated);
    };



    return (
        <ScrollView className="flex-1 bg-white px-4 pt-6">
            {loadingSession ? (
                <View className="mb-6">
                    <ActivityIndicator size="small" />
                    <Text className="text-center mt-2">Loading today's session...</Text>
                </View>
            ) : session && (
                <View className="mb-8">
                    <Text className="text-xl font-bold mb-2 text-center">Today's Workout</Text>

                    {exercises.length === 0 ? (
                        <Text className="text-center text-gray-500 italic">Rest Day</Text>
                    ) : (
                        <>
                            {exercises.map((exercise, index) => (
                                <View key={index} className="flex-row items-center justify-between mb-2">
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold">{exercise.name}</Text>
                                        <Text className="text-xs text-gray-500">
                                            {exercise.isOptional ? 'Optional • ' : ''}
                                            {exercise.isSkipped ? 'Skipped' : exercise.isCompleted ? 'Completed' : 'Pending'}
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <Pressable onPress={() => handleToggleSkip(exercise.id)}>
                                            <Text className="text-sm text-orange-600">Skip</Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleToggleComplete(exercise.id)}>
                                            <Text className="text-sm text-green-600">✓</Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleSoftDelete(exercise.id)}>
                                            <Text className="text-sm text-red-500">X</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}

                            <Pressable
                                className="bg-gray-800 py-2 px-3 rounded mt-4"
                                onPress={handleAddExercise}
                            >
                                <Text className="text-white text-center text-sm">+ Add Exercise</Text>
                            </Pressable>
                        </>
                    )}
                </View>
            )}


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
