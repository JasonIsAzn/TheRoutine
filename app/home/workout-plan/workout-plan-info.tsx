import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { deactivateWorkoutPlan, createWorkoutPlan } from '../../../api/workoutPlan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkoutDay, WorkoutExercise } from 'types/workout';

interface EditableWorkoutDay {
    label: string;
    order: number;
    selected: boolean;
    exercises: WorkoutExercise[];
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutPlanInfoModal() {
    const { plan, loading } = useWorkoutPlan();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [planName, setPlanName] = useState('');
    const [days, setDays] = useState<EditableWorkoutDay[]>([]);

    const toggleDay = (index: number) => {
        setDays(prev =>
            prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
        );
    };

    const updateLabel = (index: number, label: string) => {
        setDays(prev => prev.map((d, i) => (i === index ? { ...d, label } : d)));
    };

    const addExercise = (dayIndex: number) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex
                    ? {
                        ...d,
                        exercises: [
                            ...d.exercises,
                            { name: '', muscles: [''], isOptional: false, order: d.exercises.length },
                        ],
                    }
                    : d
            )
        );
    };

    const updateExercise = (
        dayIndex: number,
        exIndex: number,
        field: keyof WorkoutExercise,
        value: any
    ) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex
                    ? {
                        ...d,
                        exercises: d.exercises.map((ex, j) =>
                            j === exIndex ? { ...ex, [field]: value } : ex
                        ),
                    }
                    : d
            )
        );
    };

    const updateMuscle = (dayIndex: number, exIndex: number, mIndex: number, value: string) => {
        setDays(prev =>
            prev.map((d, i) => {
                if (i !== dayIndex) return d;
                const updatedExercises = d.exercises.map((ex, j) => {
                    if (j !== exIndex) return ex;
                    const newMuscles = [...ex.muscles];
                    newMuscles[mIndex] = value;
                    return { ...ex, muscles: newMuscles };
                });
                return { ...d, exercises: updatedExercises };
            })
        );
    };

    const addMuscle = (dayIndex: number, exIndex: number) => {
        setDays(prev =>
            prev.map((d, i) => {
                if (i !== dayIndex) return d;
                const updatedExercises = d.exercises.map((ex, j) => {
                    if (j !== exIndex) return ex;
                    return { ...ex, muscles: [...ex.muscles, ''] };
                });
                return { ...d, exercises: updatedExercises };
            })
        );
    };

    const removeMuscle = (dayIndex: number, exIndex: number, mIndex: number) => {
        setDays(prev =>
            prev.map((d, i) => {
                if (i !== dayIndex) return d;
                const updatedExercises = d.exercises.map((ex, j) => {
                    if (j !== exIndex) return ex;
                    return { ...ex, muscles: ex.muscles.filter((_, idx) => idx !== mIndex) };
                });
                return { ...d, exercises: updatedExercises };
            })
        );
    };

    const deleteExercise = (dayIndex: number, exIndex: number) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex
                    ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) }
                    : d
            )
        );
    };

    const handleDelete = async () => {
        if (!user) return;

        try {
            await deactivateWorkoutPlan(user.id);
            await AsyncStorage.removeItem('activePlan');
            Alert.alert('Workout plan deleted.');
            router.dismiss();
            router.replace('/home/workout-plan');
        } catch (err) {
            console.error(err);
            Alert.alert('Error deleting plan.');
        }
    };

    const initializeEdit = () => {
        if (!plan) return;
        setPlanName(plan.name);
        const initializedDays = plan.workoutDays.map((day: WorkoutDay, i: number): EditableWorkoutDay => ({
            order: i,
            selected: day.exercises.length > 0,
            label: day.label,
            exercises: day.exercises
        }));
        setDays(initializedDays);
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!user) return;

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
            const activePlanData = {
                ...payload,
                planId: planId,
                planGroupId: planGroupId,
                version: version,
            };
            await AsyncStorage.setItem('activePlan', JSON.stringify(activePlanData));
            Alert.alert('Workout plan updated.');
            router.dismiss();
            router.replace('/home/workout-plan/workout-session');
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to update plan');
        }
    };

    if (loading || !plan) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading plan...</Text>
            </View>
        );
    }

    if (isEditing) {
        return (
            <ScrollView className="flex-1 bg-white px-4 py-6">
                <Text className="text-2xl font-bold text-center mb-4">Edit Workout Plan</Text>
                <Text className="text-sm font-semibold mb-1">Plan Name</Text>
                <TextInput
                    className="border border-gray-300 rounded px-3 py-2 mb-4"
                    placeholder="Plan Name"
                    value={planName}
                    onChangeText={setPlanName}
                />

                <View className="flex-row flex-wrap justify-between mb-4">
                    {weekdays.map((w, i) => (
                        <Pressable
                            key={i}
                            onPress={() => toggleDay(i)}
                            className={`flex-1 m-1 py-2 rounded-full border items-center ${days[i]?.selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                        >
                            <Text className={days[i]?.selected ? 'text-white' : 'text-black'}>
                                {w}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {days.map((day, i) =>
                    day.selected ? (
                        <View key={i} className="mb-6 border-b border-gray-200 pb-4">
                            <Text className="text-lg font-semibold mb-1">{fullDayNames[i]}</Text>
                            <TextInput
                                className="border border-gray-300 rounded px-3 py-2 mb-2"
                                value={day.label}
                                onChangeText={text => updateLabel(i, text)}
                                placeholder="Day label"
                            />
                            {day.exercises.map((ex, j) => (
                                <View key={j} className="mb-3 ml-2">
                                    <TextInput
                                        className="border border-gray-300 rounded px-3 py-1 mb-1"
                                        placeholder="Exercise name"
                                        value={ex.name}
                                        onChangeText={text => updateExercise(i, j, 'name', text)}
                                    />
                                    <TextInput
                                        className="border border-gray-300 rounded px-3 py-1 mb-1"
                                        placeholder="Order"
                                        keyboardType="numeric"
                                        value={String(ex.order)}
                                        onChangeText={text => updateExercise(i, j, 'order', parseInt(text))}
                                    />

                                    {ex.muscles.map((muscle, mIndex) => (
                                        <View key={mIndex} className="flex-row items-center mb-1">
                                            <TextInput
                                                className="flex-1 border border-gray-300 rounded px-3 py-1 mr-2"
                                                placeholder={`Muscle ${mIndex + 1}`}
                                                value={muscle}
                                                onChangeText={text => updateMuscle(i, j, mIndex, text)}
                                            />
                                            <Pressable
                                                onPress={() => removeMuscle(i, j, mIndex)}
                                                className="w-16 h-8 bg-red-500 rounded justify-center items-center"
                                            >
                                                <Text className="text-white text-base font-bold">X</Text>
                                            </Pressable>
                                        </View>
                                    ))}

                                    <Pressable
                                        className="bg-blue-600 px-2 py-1 rounded self-start mb-2"
                                        onPress={() => addMuscle(i, j)}
                                    >
                                        <Text className="text-white text-xs">+ Add Muscle</Text>
                                    </Pressable>

                                    <Pressable
                                        className="bg-red-500 rounded px-2 py-1 self-start"
                                        onPress={() => deleteExercise(i, j)}
                                    >
                                        <Text className="text-white text-xs">Delete Exercise</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                className="bg-green-600 rounded px-4 py-2"
                                onPress={() => addExercise(i)}
                            >
                                <Text className="text-white text-sm">+ Add Exercise</Text>
                            </Pressable>
                        </View>
                    ) : null
                )}

                <Pressable className="mt-6 bg-blue-600 px-6 py-3 rounded" onPress={handleUpdate}>
                    <Text className="text-white text-center font-semibold text-lg">Update Plan</Text>
                </Pressable>
            </ScrollView>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-1">{plan.name}</Text>
            <Text className="text-xs text-gray-500 mb-3">
                Version: {plan.planGroupId}.{plan.version}
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
                Split Type: {plan.splitType} | Cycle Length: {plan.cycleLength} days
            </Text>

            {plan.workoutDays.map((day: any) => (
                <View key={day.order} className="mb-5">
                    <Text className="text-lg font-semibold">{day.label}</Text>
                    {day.exercises.map((exercise: any, index: number) => (
                        <View key={index} className="ml-2 mt-1">
                            <Text className="text-base">• {exercise.name}</Text>
                            <Text className="text-xs text-gray-500">
                                Muscles: {exercise.muscles.join(', ')}
                                {exercise.isOptional ? ' (Optional)' : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}

            <Pressable
                className="mt-6 bg-red-600 px-4 py-3 rounded"
                onPress={handleDelete}
            >
                <Text className="text-white text-center font-semibold">Delete Workout Plan</Text>
            </Pressable>

            <Pressable
                className="mt-4 bg-gray-700 px-4 py-3 rounded"
                onPress={initializeEdit}
            >
                <Text className="text-black text-center font-semibold">Edit Plan</Text>
            </Pressable>
        </ScrollView>
    );
}
