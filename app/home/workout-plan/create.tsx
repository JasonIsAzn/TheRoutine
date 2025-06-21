import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { createWorkoutPlan } from '../../../api/workoutPlan';
import { router } from 'expo-router';
import { WorkoutExercise } from 'types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface EditableWorkoutDay {
    label: string;
    order: number;
    selected: boolean;
    exercises: WorkoutExercise[];
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CreateWorkoutPlanScreen() {
    const { user } = useAuth();

    const [planName, setPlanName] = useState('Default Plan Name');
    const [days, setDays] = useState<EditableWorkoutDay[]>(
        fullDayNames.map((day, i) => ({
            order: i,
            selected: false,
            label: `Default ${day} Name`,
            exercises: [],
        }))
    );

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

    const handleCreate = async () => {
        if (!user) return;

        const hasEmptySelectedDay = days.some(day => day.selected && day.exercises.length === 0);
        if (hasEmptySelectedDay) {
            Alert.alert("Incomplete Plan", "Every selected day must have at least one exercise.");
            return;
        }

        const payload = {
            userId: user.id,
            name: planName,
            splitType: 'day-split',
            cycleLength: 7,
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
            router.replace('/home/workout-plan/workout-session');
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to create plan');
        }
    };


    return (
        <ScrollView className="flex-1 bg-white px-4 py-6">
            <Text className="text-2xl font-bold text-center mb-4">Create Workout Plan</Text>
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
                        className={`flex-1 m-1 py-2 rounded-full border items-center ${days[i].selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}
                    >
                        <Text className={days[i].selected ? 'text-white' : 'text-black'}>
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

            <Pressable className="mt-6 bg-blue-600 px-6 py-3 rounded" onPress={handleCreate}>
                <Text className="text-white text-center font-semibold text-lg">Create Plan</Text>
            </Pressable>


            <Pressable
                className="mt-4 bg-purple-600 px-6 py-3 rounded"
                onPress={() => {
                    setPlanName('4 Day Upper/Lower');

                    setDays([
                        // Sunday
                        { order: 0, label: 'Rest Day', selected: false, exercises: [] },
                        // Monday – Upper (Chest, Back, Arms)
                        {
                            order: 1,
                            label: 'Upper (Chest, Back, Arms)',
                            selected: true,
                            exercises: [
                                { name: 'Incline Dumbbell Press', order: 0, isOptional: false, muscles: ['Chest'] },
                                { name: 'Neutral-Grip Lat Pulldown', order: 1, isOptional: false, muscles: ['Back'] },
                                { name: 'Flat Barbell/Dumbell Bench Press', order: 2, isOptional: false, muscles: ['Chest'] },
                                { name: 'Chest-Supported Row', order: 3, isOptional: false, muscles: ['Back'] },
                                { name: 'Machine Preacher Curls', order: 4, isOptional: false, muscles: ['Biceps'] },
                                { name: 'Tricep Bar Pushdown', order: 5, isOptional: false, muscles: ['Triceps'] },
                            ],
                        },
                        // Tuesday – Lower (Glutes, Hamstrings)
                        {
                            order: 2,
                            label: 'Lower (Glutes, Hamstrings)',
                            selected: true,
                            exercises: [
                                { name: 'Hip Thrusts', order: 0, isOptional: false, muscles: ['Glutes'] },
                                { name: 'Bulgarian Split Squats (Drop Set)', order: 1, isOptional: false, muscles: ['Quads', 'Glutes'] },
                                { name: 'Lying Leg Curls', order: 2, isOptional: false, muscles: ['Hamstrings'] },
                                { name: 'Abduction + Adduction Machine', order: 3, isOptional: false, muscles: ['Glutes'] },
                                { name: 'Standing Calf Raises', order: 4, isOptional: false, muscles: ['Calves'] },
                            ],
                        },
                        // Wednesday
                        { order: 3, label: 'Rest Day', selected: false, exercises: [] },
                        // Thursday – Upper (Shoulders, Arms, Back)
                        {
                            order: 4,
                            label: 'Upper (Shoulders, Arms, Back)',
                            selected: true,
                            exercises: [
                                { name: 'Dumbbell Shoulder Press', order: 0, isOptional: false, muscles: ['Shoulders'] },
                                { name: 'Machine Lateral Raises', order: 1, isOptional: false, muscles: ['Shoulders'] },
                                { name: 'Lat Extensions w/ straight bar', order: 2, isOptional: false, muscles: ['Back'] },
                                { name: 'Hammer Curls', order: 3, isOptional: false, muscles: ['Biceps'] },
                                { name: 'Overhead Tricep Cable Extension', order: 4, isOptional: false, muscles: ['Triceps'] },
                                { name: 'Assisted Pullups', order: 5, isOptional: false, muscles: ['Back'] },
                            ],
                        },
                        // Friday
                        { order: 5, label: 'Rest Day', selected: false, exercises: [] },
                        // Saturday – Lower (Quad-Focused with Glutes & Hamstrings)
                        {
                            order: 6,
                            label: 'Lower (Quad-Focused with Glutes & Hamstrings)',
                            selected: true,
                            exercises: [
                                { name: 'Leg Extension (Drop Set)', order: 0, isOptional: false, muscles: ['Quads'] },
                                { name: 'Smith Machine Squats', order: 1, isOptional: false, muscles: ['Quads', 'Glutes'] },
                                { name: 'Seated Leg Curl', order: 2, isOptional: false, muscles: ['Hamstrings'] },
                                { name: 'Standing Leg Curl', order: 3, isOptional: false, muscles: ['Hamstrings'] },
                                { name: 'Leg Press + Sissy Squats', order: 4, isOptional: false, muscles: ['Quads'] },
                            ],
                        },
                    ]);
                }}
            >
                <Text className="text-white text-center font-semibold text-lg">
                    Use Pre-Made 4-Day Upper/Lower Plan
                </Text>
            </Pressable>

        </ScrollView>
    );
}
