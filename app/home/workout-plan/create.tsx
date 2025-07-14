import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Keyboard } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { createWorkoutPlan } from '../../../api/workoutPlan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useWorkoutPlan } from '../../../contexts/WorkoutPlanContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CreateWorkoutPlanScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const [planName, setPlanName] = useState('Default Plan Name');
    const [oldPlanName, setOldPlanName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const { days, setDays, resetWorkoutPlan } = useWorkoutPlan();
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

    const inputRef = useRef<TextInput>(null);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        resetWorkoutPlan();
    }, [])

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
            return;
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
            const isSelected = days[index].selected;
            if (!isSelected) {
                updated.add(index);
            } else {
                updated.delete(index);
            }
            return updated;
        });
    };


    const toggleEditLabel = (index: number, isEditing: boolean) => {
        setDays(prev =>
            prev.map((d, i) => (i === index ? { ...d, isEditing } : d))
        );

        if (isEditing) {
            setTimeout(() => {
                inputRefs.current[index]?.focus();
            }, 100);
        }
    };

    const updateLabel = (index: number, label: string) => {
        setDays(prev =>
            prev.map((d, i) => (i === index ? { ...d, label } : d))
        );
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
            resetWorkoutPlan();
            router.replace('/home/workout-plan/workout-session');
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to create plan');
        }
    };

    const openAddExerciseModal = (dayIndex: number) => {
        router.push({
            pathname: '/home/workout-plan/add-exercise',
            params: { dayIndex: dayIndex.toString() },
        });
    };

    return (
        <View className="flex-1 relative bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                {/* Workout Plan Title */}
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


                {/* Date Selection */}
                <View className="mb-8 border-b border-gray">
                    <Text className="text-lg font-semibold mb-2">Select Workout Days</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {weekdays.map((w, i) => (
                            <Pressable
                                key={i}
                                onPress={() => toggleDay(i)}
                                className={`mr-4 h-9 w-9 rounded-lg bg-gray-2 items-center justify-center ${days[i].selected ? 'bg-primary' : ''}`}
                            >
                                <Text className="text-black">
                                    {w}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Exercise Day Mapping */}
                {days.map((day, i) =>
                    day.selected && (
                        <View key={i} className="mb-6 pb-4">
                            <View className="flex-row items-center mb-2 justify-between">
                                <View className="flex-row items-center">

                                    <Pressable onPress={() => toggleExpandDay(i)} className='px-2 py-1'>
                                        <FontAwesomeIcon
                                            icon={['fas', expandedDays.has(i) ? 'chevron-up' : 'chevron-down']}
                                            size={18}
                                            color="#000"
                                        />
                                    </Pressable>
                                    {day.isEditing ? (
                                        <TextInput
                                            ref={el => { inputRefs.current[i] = el; }}
                                            value={day.label}
                                            onChangeText={text => updateLabel(i, text)}
                                            onBlur={() => saveLabel(i)}
                                            onSubmitEditing={() => saveLabel(i)}
                                            className="font-bold mr-3"
                                            style={{ fontSize: 18, lineHeight: 22 }}
                                        />
                                    ) : (
                                        <Text
                                            className="font-bold mr-3"
                                            style={{ fontSize: 18, lineHeight: 22, includeFontPadding: false }}
                                        >
                                            {day.label}
                                        </Text>
                                    )}

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
                                                <Text className="text-gray-500 text-sm">
                                                    {ex.muscles.join(', ')}
                                                </Text>
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
                    )
                )}

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


                <View className="mb-32"></View>
            </ScrollView>



            <View className='absolute w-full px-4 py-6 bottom-5'>
                <Pressable className="bg-primary rounded py-3" onPress={handleCreate}>
                    <Text className="text-black text-center font-bold text-xl">Create Plan</Text>
                </Pressable>
            </View>

        </View>
    );
}