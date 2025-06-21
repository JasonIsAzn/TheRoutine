import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import {
    fetchActiveWorkoutCycle,
    createWorkoutCycle
} from '../../../api/workoutCycle';
import { router } from 'expo-router';
import {
    fetchWorkoutSessionByDate,
    createWorkoutSession,
    markWorkoutSessionAsCompleted
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
    const [newExerciseDraft, setNewExerciseDraft] = useState({
        name: '',
        muscles: [''],
    });
    const [showAddForm, setShowAddForm] = useState(false);

    const todayIndex = new Date().getDay();

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
            if (!user || !cycle) return;

            const today = new Date().toISOString().split('T')[0];
            const cycleDayIndex = cycle.dayOrderMap.findIndex((d: number) => d === todayIndex);
            if (cycleDayIndex === -1) return;

            try {
                const result = await fetchWorkoutSessionByDate(user.id, today);
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
                const newSession = await fetchWorkoutSessionByDate(user.id, today);
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

    // Build label lookup
    const labelMap = new Map<number, string>();
    plan.workoutDays.forEach((day: { order: number; label: string }) => {
        labelMap.set(day.order, day.label);
    });

    // Build weekday info
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fullPlanDays = Array.from({ length: 7 }, (_, i) => ({
        order: i,
        label: labelMap.get(i) || 'Rest Day',
        weekday: weekdayNames[i],
    }));

    // Remaining days in current cycle
    const todayPosInCycle = cycle.dayOrderMap.findIndex((d: number) => d === todayIndex);
    const remainingCycleDays = cycle.dayOrderMap
        .slice(todayPosInCycle + 1)
        .map((dayIndex: number) => ({
            label: labelMap.get(dayIndex) || 'Rest Day',
            weekday: weekdayNames[dayIndex],
        }));

    const needed = 6 - remainingCycleDays.length;
    const upcomingPlanDays = needed > 0 ? fullPlanDays.slice(0, needed) : [];

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


    return (
        <ScrollView className="flex-1 bg-white px-4 pt-6">
            {/* Session UI */}
            {loadingSession ? (
                <View className="mb-6">
                    <ActivityIndicator size="small" />
                    <Text className="text-center mt-2">Loading today's session...</Text>
                </View>
            ) : session && (
                <View className="mb-8">
                    <Text className="text-xl font-bold mb-2 text-center">Today's Workout</Text>
                    <Text className="text-lg mb-2 text-center">{plan.name}</Text>

                    {session.isCompleted && (
                        <Text className="text-green-600 text-center font-semibold mb-2">✅ Session Completed</Text>
                    )}

                    {exercises.length === 0 ? (
                        <Text className="text-center text-gray-500 italic">Rest Day</Text>
                    ) : (
                        exercises.map((exercise, index) => (
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
                        ))
                    )}

                    <Pressable
                        className="bg-gray-800 py-2 px-3 rounded mt-4"
                        onPress={() => setShowAddForm(true)}
                    >
                        <Text className="text-white text-center text-sm">+ Add Exercise</Text>
                    </Pressable>

                    <Pressable
                        className="mt-4 bg-green-600 py-2 px-4 rounded"
                        onPress={async () => {
                            try {
                                await markWorkoutSessionAsCompleted(session.id);
                                Alert.alert("Session marked as complete.");
                                setSession((prev: any) => ({ ...prev, isCompleted: true }));
                            } catch (err) {
                                console.error(err);
                                Alert.alert("Failed to mark session as complete.");
                            }
                        }}
                    >
                        <Text className="text-white text-center font-semibold">Mark Session Complete</Text>
                    </Pressable>

                    {/* ... your Add Exercise form remains the same */}
                </View>
            )}

            {/* Upcoming Days */}
            <Text className="text-xl font-bold mb-4 text-center">Upcoming Days</Text>

            {remainingCycleDays.map((day: { label: string; weekday: string }, idx: number) => (
                <View key={`remain-${idx}`} className="mb-4">
                    <Text className="text-sm text-gray-500">{day.weekday}</Text>
                    <Text className="text-base font-semibold text-black">{day.label}</Text>
                </View>
            ))}

            {needed > 0 && (
                <Text className="text-center italic text-gray-400 my-2">-- work cycle complete --</Text>
            )}

            {upcomingPlanDays.map((day, idx) => (
                <View key={`plan-${idx}`} className="mb-4">
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