import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchActiveWorkoutCycle, createWorkoutCycle } from '../../../api/workoutCycle';
import { fetchWorkoutSessionByDate, createWorkoutSession, markWorkoutSessionAsCompleted } from '../../../api/workoutSession';
import { fetchSessionExercises, toggleCompleteExercise, toggleSkipExercise, softDeleteExercise } from '../../../api/workoutSessionExercise';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useRouter } from 'expo-router';

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const { plan, loading: planLoading } = useWorkoutPlan();
    const router = useRouter();

    const [cycle, setCycle] = useState<any>(null);
    const [loadingCycle, setLoadingCycle] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loadingSession, setLoadingSession] = useState(true);

    const todayIndex = new Date().getUTCDay();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const initialize = async () => {
                if (!user || !plan) return;

                try {
                    const existing = await fetchActiveWorkoutCycle(user.id);
                    if (isActive) setCycle(existing);
                } catch {
                    const localNow = new Date();
                    const localMidnight = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate());

                    const utcFake = new Date(localMidnight.getTime() + localMidnight.getTimezoneOffset() * 60000);

                    await createWorkoutCycle({
                        userId: user.id,
                        workoutPlanId: plan.planId,
                        startDate: utcFake,
                    });

                    const newCycle = await fetchActiveWorkoutCycle(user.id);
                    if (isActive) setCycle(newCycle);
                } finally {
                    if (isActive) setLoadingCycle(false);
                }
            };

            if (!planLoading && plan) {
                initialize();
            }

            return () => {
                isActive = false;
            };
        }, [user, plan, planLoading])
    );

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const initTodaySession = async () => {
                if (!user || !cycle) return;

                const now = new Date();
                const today = `${now.getFullYear()}-${(now.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

                const timezoneOffsetMinutes = new Date().getTimezoneOffset();
                const nowLocal = new Date(now.getTime() - timezoneOffsetMinutes * 60000);
                const cycleStartLocal = new Date(
                    new Date(cycle.startDate).getTime() - timezoneOffsetMinutes * 60000
                );

                const cycleDayIndex = Math.floor(
                    (nowLocal.getTime() - cycleStartLocal.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (cycleDayIndex < 0 || cycleDayIndex > 6) return;

                try {
                    const result = await fetchWorkoutSessionByDate(user.id, today);
                    if (isActive) {
                        setSession(result);
                        const ex = await fetchSessionExercises(result.id);
                        setExercises(ex);
                    }
                } catch {
                    await createWorkoutSession({
                        userId: user.id,
                        workoutCycleId: cycle.id,
                        cycleDayIndex,
                        date: today,
                    });

                    const newSession = await fetchWorkoutSessionByDate(user.id, today);
                    if (isActive) {
                        setSession(newSession);
                        const ex = await fetchSessionExercises(newSession.id);
                        setExercises(ex);
                    }
                } finally {
                    if (isActive) setLoadingSession(false);
                }
            };

            if (!loadingCycle && cycle) {
                initTodaySession();
            }

            return () => {
                isActive = false;
            };
        }, [user, cycle, loadingCycle])
    );

    if (planLoading || loadingCycle || !plan || !cycle) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
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
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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


    const handleSwap = async (exercise: any) => {
        await softDeleteExercise(exercise.id);
        const updated = await fetchSessionExercises(session.id);
        setExercises(updated);

        router.push({
            pathname: '/home/workout-plan/add-exercise-session',
            params: {
                sessionId: session.id.toString(),
                order: exercise.order.toString()
            },
        });
    };

    if (loadingSession || !session) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" />
                <Text className="mt-4">Loading today's session...</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 relative'>
            <ScrollView className="flex-1 bg-background px-4 pt-2">
                <View className="mb-8">
                    <Text className="text-2xl font-bold mb-10">{session.label}</Text>

                    {exercises.length === 0 ? (
                        <View className="items-center justify-center h-32">
                            <Text className="text-xl font-semibold text-center text-gray">no intense workout</Text>
                            <Text className="text-xl font-semibold text-center text-gray">light cardio only or abs</Text>
                        </View>
                    ) : session.isCompleted ? (
                        <View className="items-center justify-center h-32">
                            <Text className="text-xl font-semibold text-center text-gray">Workout Session Completed</Text>
                        </View>

                    ) : (
                        <View>
                            {exercises.map((exercise) => (
                                <View key={exercise.id} className="flex-row items-center mb-8 ">
                                    <View className='flex-row items-center'>
                                        <Pressable
                                            onPress={() =>
                                                !exercise.isSkipped
                                                    ? handleToggleComplete(exercise.id)
                                                    : handleToggleSkip(exercise.id)
                                            }
                                            className="flex-1 flex-row items-center gap-2"
                                        >
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
                                        </Pressable>

                                        {!(exercise.isSkipped || exercise.isCompleted) && (
                                            <View className="flex-row gap-5">
                                                <Pressable onPress={() => handleSwap(exercise)}>
                                                    <FontAwesomeIcon
                                                        icon={['fas', 'right-left']}
                                                        size={16}
                                                        color="#808080"
                                                    />
                                                </Pressable>
                                                <Pressable onPress={() => handleToggleSkip(exercise.id)}>
                                                    <FontAwesomeIcon icon={['fas', 'ban']} size={16} color="#808080" />
                                                </Pressable>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}

                            <Pressable
                                className="bg-primary rounded-xl px-4 py-2 justify-center items-center w-1/2 self-center my-4"
                                onPress={() =>
                                    router.push({
                                        pathname: '/home/workout-plan/add-exercise-session',
                                        params: {
                                            sessionId: session.id.toString(),
                                            order: (Math.max(-1, ...exercises.map((e) => e.order)) + 1).toString(),
                                        },
                                    })
                                }
                            >
                                <Text className="text-black text-center">Add Exercise</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
                <View className='mb-20' />
            </ScrollView>


            {!session.isCompleted && (
                <Pressable
                    className='bg-primary absolute bottom-0 right-0 m-8 justify-center items-center rounded-2xl px-8 py-3'
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
                    <Text className='text-2xl font-bold'>Done</Text>

                </Pressable>
            )
            }
        </View >
    );
}