import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Keyboard } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { createWorkoutPlan, deactivateWorkoutPlan } from '../../../api/workoutPlan'; // Use your create logic for new versioning
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useWorkoutPlan } from '../../../contexts/WorkoutPlanContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fetchWorkoutSessionByDate, deleteWorkoutSession } from '../../../api/workoutSession';
import { deactivateWorkoutCycle, updateWorkoutCyclePlanId } from '../../../api/workoutCycle';

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function UpdateWorkoutPlanScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const [planName, setPlanName] = useState('');
    const [oldPlanName, setOldPlanName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { days, setDays } = useWorkoutPlan();
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

    const inputRef = useRef<TextInput>(null);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const stored = await AsyncStorage.getItem('activePlan');
                if (stored) {
                    const plan = JSON.parse(stored);
                    setPlanName(plan.name);

                    const loadedDays = plan.workoutDays.map((d: any) => ({
                        order: d.order,
                        label: d.label === 'Rest Day' ? `Default Day ${d.order + 1}` : d.label,
                        selected: d.label !== 'Rest Day',
                        exercises: d.exercises,
                    }));

                    setDays(loadedDays);

                    const expanded = new Set<number>();
                    loadedDays.forEach((d: any, i: number) => {
                        if (d.selected) expanded.add(i);
                    });
                    setExpandedDays(expanded);
                }
            } catch (err) {
                console.error('Failed to load plan', err);
            }
        };
        loadPlan();
    }, []);
    const handleRename = () => {
        setIsEditing(true);
        setOldPlanName(planName);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleSave = () => {
        setIsEditing(false);
        Keyboard.dismiss();
        if (planName.trim() === '') {
            setPlanName(oldPlanName);
        }
    };

    const toggleDay = (index: number) => {
        setDays(prev =>
            prev.map((d, i) => {
                if (i === index) {
                    const newSelected = !d.selected;
                    return {
                        ...d,
                        selected: newSelected,
                        exercises: newSelected ? d.exercises : [],
                    };
                }
                return d;
            })
        );

        setExpandedDays(prev => {
            const updated = new Set(prev);
            if (!prev.has(index)) {
                updated.add(index);
            } else {
                updated.delete(index);
            }
            return updated;
        });
    };

    const toggleEditLabel = (index: number, isEditing: boolean) => {
        setDays(prev => prev.map((d, i) => (i === index ? { ...d, isEditing } : d)));

        if (isEditing) {
            setTimeout(() => {
                inputRefs.current[index]?.focus();
            }, 100);
        }
    };

    const updateLabel = (index: number, label: string) => {
        setDays(prev => prev.map((d, i) => (i === index ? { ...d, label } : d)));
    };

    const saveLabel = (index: number) => {
        setDays(prev =>
            prev.map(d => {
                if (d.order !== index) return d;
                const trimmed = d.label.trim();
                return {
                    ...d,
                    label: trimmed === '' ? `Default Day ${index + 1}` : trimmed,
                    isEditing: false,
                };
            })
        );
    };

    const toggleExpandDay = (index: number) => {
        setExpandedDays(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const deleteExercise = (dayIndex: number, exIndex: number) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) } : d
            )
        );
    };

    const openAddExerciseModal = (dayIndex: number) => {
        router.push({
            pathname: '/home/workout-plan/add-exercise',
            params: { dayIndex: dayIndex.toString() },
        });
    };

    const handleUpdate = async () => {
        if (!user) return;

        const hasEmptySelectedDay = days.some(day => day.selected && day.exercises.length === 0);
        if (hasEmptySelectedDay) {
            Alert.alert('Incomplete Plan', 'Every selected day must have at least one exercise.');
            return;
        }

        const todayIndex = new Date().getUTCDay();
        const stored = await AsyncStorage.getItem('activePlan');
        if (!stored) {
            Alert.alert('No active plan found.');
            return;
        }
        const plan = JSON.parse(stored);

        let existingSession = null;
        try {
            existingSession = await fetchWorkoutSessionByDate(user.id, new Date().toISOString().split('T')[0]);
        } catch {
            existingSession = null;
        }

        if (existingSession) {
            try {
                if (existingSession) {
                    await deleteWorkoutSession(existingSession.id);
                    console.log("Deleted today's session because today changed or session existed.");
                }
            } catch (err) {
                console.warn('Error deleting today’s session:', err);
            }
        }

        const payload = {
            userId: user.id,
            name: planName,
            splitType: plan.splitType,
            cycleLength: plan.cycleLength,
            planGroupId: plan.planGroupId,
            workoutDays: days.map(day => ({
                label: day.selected ? day.label : 'Rest Day',
                order: day.order,
                exercises: day.selected ? day.exercises : [],
            })),
        };

        try {
            const { planId, planGroupId, version } = await createWorkoutPlan(payload);
            await updateWorkoutCyclePlanId(user.id, planId);

            const activePlanData = {
                ...payload,
                planId,
                planGroupId,
                version,
            };
            await AsyncStorage.setItem('activePlan', JSON.stringify(activePlanData));

            Alert.alert('Success', 'Plan updated.');

            router.dismiss();
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to update plan');
        }
    };

    const handleDelete = async () => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            let existingSession = null;
            try {
                existingSession = await fetchWorkoutSessionByDate(user.id, today);
            } catch {
                existingSession = null;
            }

            if (existingSession) {
                try {
                    await deleteWorkoutSession(existingSession.id);
                    console.log('Deleted today\'s session.');
                } catch (err) {
                    console.warn('Failed to delete today\'s session:', err);
                }
            }

            await deactivateWorkoutPlan(user.id);
            await deactivateWorkoutCycle(user.id);
            await AsyncStorage.removeItem('activePlan');

            Alert.alert('Workout plan and cycle deleted.');
            router.dismissAll();
            router.replace('/home/workout-plan');
        } catch (err) {
            console.error(err);
            Alert.alert('Error deleting plan and cycle.');
        }
    };


    return (
        <View className="flex-1 relative bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                <View className="flex-row items-center mb-8">
                    {isEditing ? (
                        <TextInput
                            ref={inputRef}
                            value={planName}
                            onChangeText={setPlanName}
                            onBlur={handleSave}
                            onSubmitEditing={handleSave}
                            className="text-3xl font-bold mr-3"
                        />
                    ) : (
                        <Text className="text-3xl font-bold mr-3">{planName}</Text>
                    )}

                    {isEditing ? (
                        <Pressable onPress={handleSave}>
                            <Text className="underline text-primary text-xl">done</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={handleRename}>
                            <Text className="underline text-primary text-xl">rename</Text>
                        </Pressable>
                    )}
                </View>

                <View className="mb-8 border-b border-gray">
                    <Text className="text-lg font-semibold mb-2">Select Workout Days</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {weekdays.map((w, i) => (
                            <Pressable
                                key={i}
                                onPress={() => toggleDay(i)}
                                className={`mr-4 h-9 w-9 rounded-lg bg-gray-2 items-center justify-center ${days[i].selected ? 'bg-primary' : ''}`}
                            >
                                <Text className="text-black">{w}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {days.map((day, i) =>
                    day.selected ? (
                        <View key={i} className="mb-6 pb-4">
                            <View className="flex-row items-center mb-2">
                                <View className="flex-row items-center">
                                    <Pressable onPress={() => toggleExpandDay(i)} className="px-2 py-1">
                                        <FontAwesomeIcon
                                            icon={['fas', expandedDays.has(i) ? 'chevron-up' : 'chevron-down']}
                                            size={18}
                                            color="#000"
                                        />
                                    </Pressable>
                                    <View className="flex-shrink max-w-[70%] mr-3">
                                        {day.isEditing ? (
                                            <TextInput
                                                ref={el => {
                                                    inputRefs.current[i] = el;
                                                }}
                                                value={day.label}
                                                onChangeText={text => updateLabel(i, text)}
                                                onBlur={() => saveLabel(i)}
                                                onSubmitEditing={() => saveLabel(i)}
                                                multiline
                                                className="font-bold text-[18px] leading-[22px]"
                                            />
                                        ) : (
                                            <Text
                                                className="font-bold text-[18px] leading-[22px]"
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {day.label}
                                            </Text>
                                        )}
                                    </View>
                                    {day.isEditing ? (
                                        <Pressable onPress={() => saveLabel(i)}>
                                            <Text className="underline text-primary text-lg">done</Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable onPress={() => toggleEditLabel(i, true)}>
                                            <Text className="underline text-primary text-lg">rename</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {expandedDays.has(i) && (
                                <>
                                    {day.exercises.map((ex, j) => (
                                        <View key={j} className="flex-row items-center justify-between mb-3 ml-2">
                                            <View>
                                                <Text className="text-base font-semibold">{ex.name}</Text>
                                                <Text className="text-gray-500 text-sm">{ex.muscles.join(', ')}</Text>
                                            </View>
                                            <Pressable onPress={() => deleteExercise(i, j)}>
                                                <FontAwesomeIcon icon={['far', 'circle-xmark']} size={20} color="#555" />
                                            </Pressable>
                                        </View>
                                    ))}

                                    <Pressable
                                        className="bg-primary rounded-xl px-4 py-2 justify-center items-center w-1/2 self-center my-4"
                                        onPress={() => openAddExerciseModal(i)}
                                    >
                                        <Text className="text-black text-center">Add Exercise</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    ) : null
                )}

                <View className="mb-32"></View>
            </ScrollView>

            <View className="absolute w-full px-4 py-6 bottom-10">
                <Pressable className="bg-primary rounded py-3" onPress={handleUpdate}>
                    <Text className="text-black text-center font-bold text-xl">Save Updates</Text>
                </Pressable>

                <Pressable
                    className="mt-6 bg-red-600 px-4 py-3 rounded"
                    onPress={handleDelete}
                >
                    <Text className="text-white text-center font-semibold">Delete Workout Plan</Text>
                </Pressable>

            </View>
        </View>
    );
}
