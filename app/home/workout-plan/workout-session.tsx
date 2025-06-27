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
import { fetchBaseExercises } from '../../../api/baseExercise';
import { Picker } from '@react-native-picker/picker';
import { BaseExercise } from 'types/workout';


interface ExerciseDraft {
    name: string;
    muscles: string[];
    useBaseSelect: boolean;
    baseExerciseId: number | null;
}


export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const { plan, loading: planLoading } = useWorkoutPlan();

    const [cycle, setCycle] = useState<any>(null);
    const [loadingCycle, setLoadingCycle] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loadingSession, setLoadingSession] = useState(true);
    const [newExerciseDraft, setNewExerciseDraft] = useState<{
        name: string;
        muscles: string[];
        useBaseSelect: boolean;
        baseExerciseId: number | null;
    }>({
        name: '',
        muscles: [''],
        useBaseSelect: false,
        baseExerciseId: null,
    });

    const [showAddForm, setShowAddForm] = useState(false);

    const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);

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

    useEffect(() => {
        const loadBaseExercises = async () => {
            try {
                const res = await fetchBaseExercises();
                setBaseExercises(res);
            } catch (err) {
                console.error('Failed to load base exercises:', err);
            }
        };
        loadBaseExercises();
    }, []);


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
                        exercises.map((exercise) => (
                            <View key={exercise.id} className="flex-row items-center justify-between mb-2">
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

                    {showAddForm && (
                        <View className="mt-4 bg-gray-100 p-4 rounded">
                            {/* Toggle Manual vs Base Picker */}
                            <View className="flex-row mb-2 items-center">
                                <Text className="mr-2">Use Base:</Text>
                                <Pressable
                                    className={`px-3 py-1 rounded ${newExerciseDraft.useBaseSelect ? 'bg-green-600' : 'bg-gray-400'}`}
                                    onPress={() =>
                                        setNewExerciseDraft((prev) => ({
                                            ...prev,
                                            useBaseSelect: !prev.useBaseSelect,
                                            name: '',
                                            muscles: [''],
                                            baseExerciseId: null,
                                        }))
                                    }
                                >
                                    <Text className="text-white">{newExerciseDraft.useBaseSelect ? 'ON' : 'OFF'}</Text>
                                </Pressable>
                            </View>

                            {newExerciseDraft.useBaseSelect ? (
                                <View className="border border-gray-300 rounded mb-2 bg-white">
                                    <Picker
                                        selectedValue={newExerciseDraft.baseExerciseId ?? ''}
                                        onValueChange={(baseId) => {
                                            const selected = baseExercises.find((b) => b.id === baseId);
                                            if (selected) {
                                                setNewExerciseDraft((prev) => ({
                                                    ...prev,
                                                    baseExerciseId: selected.id,
                                                    name: selected.name,
                                                    muscles: selected.muscles,
                                                }));
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Select Exercise..." value="" />
                                        {baseExercises.map((base) => (
                                            <Picker.Item key={base.id} label={base.name} value={base.id} />
                                        ))}
                                    </Picker>
                                </View>
                            ) : (
                                <TextInput
                                    className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
                                    placeholder="Exercise name"
                                    value={newExerciseDraft.name}
                                    onChangeText={(text) =>
                                        setNewExerciseDraft((prev) => ({ ...prev, name: text }))
                                    }
                                />
                            )}

                            {newExerciseDraft.muscles.map((muscle, idx) => (
                                <View key={idx} className="flex-row items-center mb-2">
                                    <TextInput
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white"
                                        placeholder={`Muscle ${idx + 1}`}
                                        value={muscle}
                                        onChangeText={(text) => {
                                            const updated = [...newExerciseDraft.muscles];
                                            updated[idx] = text;
                                            setNewExerciseDraft((prev) => ({ ...prev, muscles: updated }));
                                        }}
                                    />
                                    <Pressable
                                        className="ml-2 px-2 py-1 bg-red-500 rounded"
                                        onPress={() => {
                                            const updated = newExerciseDraft.muscles.filter((_, i) => i !== idx);
                                            setNewExerciseDraft((prev) => ({ ...prev, muscles: updated }));
                                        }}
                                    >
                                        <Text className="text-white">X</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                className="mb-2 px-3 py-2 bg-blue-600 rounded"
                                onPress={() =>
                                    setNewExerciseDraft((prev) => ({
                                        ...prev,
                                        muscles: [...prev.muscles, ''],
                                    }))
                                }
                            >
                                <Text className="text-white text-sm text-center">+ Add Muscle</Text>
                            </Pressable>

                            <Pressable
                                className="bg-green-600 px-3 py-2 rounded"
                                onPress={async () => {
                                    const newExercise = {
                                        workoutSessionId: session.id,
                                        name: newExerciseDraft.name,
                                        muscles: newExerciseDraft.muscles.filter((m) => m.trim() !== ''),
                                        order: exercises.length,
                                        isOptional: true,
                                        isCompleted: false,
                                        isSkipped: false,
                                        isDeleted: false,
                                        weight: null,
                                        baseExerciseId: newExerciseDraft.baseExerciseId ?? null,
                                    };

                                    const created = await addSessionExercise(newExercise);
                                    setExercises((prev) => [...prev, created]);
                                    setNewExerciseDraft({ name: '', muscles: [''], useBaseSelect: false, baseExerciseId: null });
                                    setShowAddForm(false);
                                }}
                            >
                                <Text className="text-white text-center text-sm">Save Exercise</Text>
                            </Pressable>
                        </View>
                    )}

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