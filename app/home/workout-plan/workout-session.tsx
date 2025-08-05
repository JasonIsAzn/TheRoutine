import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchActiveWorkoutCycle, createWorkoutCycle } from '../../../api/workoutCycle';
import { fetchWorkoutSessionByDate, createWorkoutSession, markWorkoutSessionAsCompleted } from '../../../api/workoutSession';
import { fetchSessionExercises, toggleCompleteExercise, toggleSkipExercise, addSessionExercise, softDeleteExercise } from '../../../api/workoutSessionExercise';
import { fetchBaseExercises } from '../../../api/baseExercise';
import { Picker } from '@react-native-picker/picker';
import { BaseExercise } from 'types/workout';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useRouter } from 'expo-router';


interface ExerciseDraft {
    name: string;
    muscles: string[];
    useBaseSelect: boolean;
    baseExerciseId: number | null;
    order?: number;
}

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const { plan, loading: planLoading } = useWorkoutPlan();
    const router = useRouter();

    const [cycle, setCycle] = useState<any>(null);
    const [loadingCycle, setLoadingCycle] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loadingSession, setLoadingSession] = useState(true);
    const [newExerciseDraft, setNewExerciseDraft] = useState<ExerciseDraft>({
        name: '',
        muscles: [''],
        useBaseSelect: false,
        baseExerciseId: null,
    });

    const [showAddForm, setShowAddForm] = useState(false);

    const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);

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
                    await createWorkoutCycle({
                        userId: user.id,
                        workoutPlanId: plan.planId,
                        startDate: new Date()
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

                const cycleDayIndex = cycle.dayOrderMap.findIndex(
                    (d: number) => d === todayIndex
                );
                if (cycleDayIndex === -1) return;

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

                <View className="mb-8 border-b border-[#8080800/70]">
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

                {
                    remainingCycleDays.map((day: { label: string; weekday: string }, idx: number) => (
                        <View key={`remain-${idx}`} className="mb-2 flex-row items-center ">
                            <Text className="text-lg text-gray w-[10%]">{day.weekday}</Text>
                            <Text className="text-lg font-bold text-gray">{day.label}</Text>
                        </View>
                    ))
                }

                {
                    needed > 0 && (
                        <Text className="text-center text-gray font-bold my-4">work cycle complete</Text>
                    )
                }

                {
                    upcomingPlanDays.map((day, idx) => (
                        <View key={`plan-${idx}`} className="mb-6 flex-row items-center ">
                            <Text className="text-lg text-gray w-[10%]">{day.weekday}</Text>
                            <Text className="text-lg font-bold text-gray">{day.label}</Text>
                        </View>
                    ))
                }

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


//   <Pressable
//                 className="bg-gray-800 py-2 px-3 rounded mt-4"
//                 onPress={() => setShowAddForm(true)}
//             >
//                 <Text className="text-white text-center text-sm">+ Add Exercise</Text>
//             </Pressable>




// {showAddForm && (
//     <View className="mt-4 bg-gray-100 p-4 rounded">
//         {/* Toggle Manual vs Base Picker */}
//         <View className="flex-row mb-2 items-center">
//             <Text className="mr-2">Use Base:</Text>
//             <Pressable
//                 className={`px-3 py-1 rounded ${newExerciseDraft.useBaseSelect ? 'bg-green-600' : 'bg-gray-400'}`}
//                 onPress={() =>
//                     setNewExerciseDraft((prev) => ({
//                         ...prev,
//                         useBaseSelect: !prev.useBaseSelect,
//                         name: '',
//                         muscles: [''],
//                         baseExerciseId: null,
//                     }))
//                 }
//             >
//                 <Text className="text-white">{newExerciseDraft.useBaseSelect ? 'ON' : 'OFF'}</Text>
//             </Pressable>
//         </View>

//         {newExerciseDraft.useBaseSelect ? (
//             <View className="border border-gray-300 rounded mb-2 bg-white">
//                 <Picker
//                     selectedValue={newExerciseDraft.baseExerciseId ?? ''}
//                     onValueChange={(baseId) => {
//                         const selected = baseExercises.find((b) => b.id === baseId);
//                         if (selected) {
//                             setNewExerciseDraft((prev) => ({
//                                 ...prev,
//                                 baseExerciseId: selected.id,
//                                 name: selected.name,
//                                 muscles: selected.muscles,
//                             }));
//                         }
//                     }}
//                 >
//                     <Picker.Item label="Select Exercise..." value="" />
//                     {baseExercises.map((base) => (
//                         <Picker.Item key={base.id} label={base.name} value={base.id} />
//                     ))}
//                 </Picker>
//             </View>
//         ) : (
//             <TextInput
//                 className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
//                 placeholder="Exercise name"
//                 value={newExerciseDraft.name}
//                 onChangeText={(text) =>
//                     setNewExerciseDraft((prev) => ({ ...prev, name: text }))
//                 }
//             />
//         )}

//         {newExerciseDraft.muscles.map((muscle, idx) => (
//             <View key={idx} className="flex-row items-center mb-2">
//                 <TextInput
//                     className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white"
//                     placeholder={`Muscle ${idx + 1}`}
//                     value={muscle}
//                     onChangeText={(text) => {
//                         const updated = [...newExerciseDraft.muscles];
//                         updated[idx] = text;
//                         setNewExerciseDraft((prev) => ({ ...prev, muscles: updated }));
//                     }}
//                 />
//                 <Pressable
//                     className="ml-2 px-2 py-1 bg-red-500 rounded"
//                     onPress={() => {
//                         const updated = newExerciseDraft.muscles.filter((_, i) => i !== idx);
//                         setNewExerciseDraft((prev) => ({ ...prev, muscles: updated }));
//                     }}
//                 >
//                     <Text className="text-white">X</Text>
//                 </Pressable>
//             </View>
//         ))}

//         <Pressable
//             className="mb-2 px-3 py-2 bg-blue-600 rounded"
//             onPress={() =>
//                 setNewExerciseDraft((prev) => ({
//                     ...prev,
//                     muscles: [...prev.muscles, ''],
//                 }))
//             }
//         >
//             <Text className="text-white text-sm text-center">+ Add Muscle</Text>
//         </Pressable>

//         <Pressable
//             className="bg-green-600 px-3 py-2 rounded"
//             onPress={async () => {
//                 const newExercise = {
//                     workoutSessionId: session.id,
//                     name: newExerciseDraft.name,
//                     muscles: newExerciseDraft.muscles.filter((m) => m.trim() !== ''),
//                     order: newExerciseDraft.order ?? exercises.length,
//                     isOptional: true,
//                     isCompleted: false,
//                     isSkipped: false,
//                     isDeleted: false,
//                     weight: null,
//                     baseExerciseId: newExerciseDraft.baseExerciseId ?? null,
//                 };

//                 const created = await addSessionExercise(newExercise);

//                 let updatedExercises = await fetchSessionExercises(session.id);


//                 updatedExercises = updatedExercises
//                     .filter((e: SessionExercise) => !e.isDeleted)
//                     .sort((a: SessionExercise, b: SessionExercise) => a.order - b.order);


//                 for (let i = 0; i < updatedExercises.length; i++) {
//                     if (updatedExercises[i].order !== i) {
//                         updatedExercises[i].order = i;
//                         await addSessionExercise({ ...updatedExercises[i], id: updatedExercises[i].id });
//                     }
//                 }

//                 setExercises(updatedExercises);
//                 setNewExerciseDraft({ name: '', muscles: [''], useBaseSelect: false, baseExerciseId: null });
//                 setShowAddForm(false);
//             }}
//         >
//             <Text className="text-white text-center text-sm">Save Exercise</Text>
//         </Pressable>

//     </View>
// )}
