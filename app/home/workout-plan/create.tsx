import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Keyboard } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { createWorkoutPlan } from '../../../api/workoutPlan';
import { router } from 'expo-router';
import { BaseExercise, WorkoutExercise } from 'types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { fetchBaseExercises } from '../../../api/baseExercise';

interface EditableWorkoutDay {
    label: string;
    order: number;
    selected: boolean;
    exercises: WorkoutExercise[];
    isEditing?: boolean;
}



const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CreateWorkoutPlanScreen() {
    const { user } = useAuth();

    const [planName, setPlanName] = useState('Default Plan Name');
    const [oldPlanName, setOldPlanName] = useState("");
    const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const [days, setDays] = useState<EditableWorkoutDay[]>(
        fullDayNames.map((day, i) => ({
            order: i,
            selected: false,
            label: `Default ${day} Name`,
            exercises: [],
        }))
    );
    const inputRef = useRef<TextInput>(null);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const res = await fetchBaseExercises();
                setBaseExercises(res);
            } catch (err) {
                console.error('Failed to load base exercises:', err);
            }
        };
        loadExercises();
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
            return;
        }
    };

    const toggleDay = (index: number) => {
        setDays(prev =>
            prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
        );
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


    const addExercise = (dayIndex: number) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex
                    ? {
                        ...d,
                        exercises: [
                            ...d.exercises,
                            { name: '', muscles: [''], isOptional: false, order: d.exercises.length, useBaseSelect: false, baseExerciseId: undefined },
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
        <View className="flex-1 relative bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                {/* Workout Plan TItle */}
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
                                className={`mr-4 h-9 w-9 rounded-lg bg-gray-2 items-center justify-center ${days[i].selected && 'bg-primary'}`}
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
                        <View key={i} className="mb-6 border-b border-gray-200 pb-4">
                            <View
                                className="flex-row items-center mb-2"
                                style={{ height: 24 }}
                            >
                                {day.isEditing ? (
                                    <TextInput
                                        ref={el => { inputRefs.current[i] = el; }}
                                        value={day.label}
                                        onChangeText={text => updateLabel(i, text)}
                                        onBlur={() => saveLabel(i)}
                                        onSubmitEditing={() => saveLabel(i)}
                                        className="font-bold mr-3"
                                        style={{
                                            fontSize: 18,
                                            lineHeight: 22,
                                        }}
                                    />
                                ) : (
                                    <Text
                                        className="font-bold mr-3"
                                        style={{
                                            fontSize: 18,
                                            lineHeight: 22,
                                            includeFontPadding: false,
                                        }}
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



                            {day.exercises.map((ex, j) => (
                                <View key={j} className="flex-row items-center justify-between mb-3 ml-2">
                                    <View>
                                        <Text className="text-base font-semibold">{ex.name}</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {ex.muscles.join(', ')}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => deleteExercise(i, j)}>
                                        <Text className="text-gray-500 text-xl">✕</Text>
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
                    )
                )}


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

//    {day.exercises.map((ex, j) => (
//                                 <View key={j} className="mb-3 ml-2">
//                                     {/* Toggle between Manual and Base */}
//                                     <View className="flex-row mb-2 items-center">
//                                         <Text className="mr-2">Use Base:</Text>
//                                         <Pressable
//                                             className={`px-3 py-1 rounded ${ex.useBaseSelect ? 'bg-green-600' : 'bg-gray-400'}`}
//                                             onPress={() => updateExercise(i, j, 'useBaseSelect', !ex.useBaseSelect)}
//                                         >
//                                             <Text className="text-white">{ex.useBaseSelect ? 'ON' : 'OFF'}</Text>
//                                         </Pressable>
//                                     </View>

//                                     {/* Show Picker or TextInput based on toggle */}
//                                     {ex.useBaseSelect ? (
//                                         <View className="border border-gray-300 rounded mb-2">
//                                             <Picker
//                                                 selectedValue={ex.baseExerciseId ?? ''}
//                                                 onValueChange={(baseId) => {
//                                                     const selected = baseExercises.find(b => b.id === baseId);
//                                                     if (selected) {
//                                                         updateExercise(i, j, 'baseExerciseId', selected.id);
//                                                         updateExercise(i, j, 'name', selected.name);
//                                                         updateExercise(i, j, 'muscles', selected.muscles);
//                                                     }
//                                                 }}
//                                             >
//                                                 <Picker.Item label="Select Exercise..." value="" />
//                                                 {baseExercises.map((base) => (
//                                                     <Picker.Item key={base.id} label={base.name} value={base.id} />
//                                                 ))}
//                                             </Picker>
//                                         </View>
//                                     ) : (
//                                         <TextInput
//                                             className="border border-gray-300 rounded px-3 py-1 mb-1"
//                                             placeholder="Exercise name"
//                                             value={ex.name}
//                                             onChangeText={text => updateExercise(i, j, 'name', text)}
//                                         />
//                                     )}

//                                     <TextInput
//                                         className="border border-gray-300 rounded px-3 py-1 mb-1"
//                                         placeholder="Order"
//                                         keyboardType="numeric"
//                                         value={String(ex.order)}
//                                         onChangeText={text => updateExercise(i, j, 'order', parseInt(text))}
//                                     />

//                                     {/* Muscle fields */}
//                                     {ex.muscles.map((muscle, mIndex) => (
//                                         <View key={mIndex} className="flex-row items-center mb-1">
//                                             <TextInput
//                                                 className="flex-1 border border-gray-300 rounded px-3 py-1 mr-2"
//                                                 placeholder={`Muscle ${mIndex + 1}`}
//                                                 value={muscle}
//                                                 onChangeText={text => updateMuscle(i, j, mIndex, text)}
//                                             />
//                                             <Pressable
//                                                 onPress={() => removeMuscle(i, j, mIndex)}
//                                                 className="w-16 h-8 bg-red-500 rounded justify-center items-center"
//                                             >
//                                                 <Text className="text-white text-base font-bold">X</Text>
//                                             </Pressable>
//                                         </View>
//                                     ))}

//                                     <Pressable
//                                         className="bg-blue-600 px-2 py-1 rounded self-start mb-2"
//                                         onPress={() => addMuscle(i, j)}
//                                     >
//                                         <Text className="text-white text-xs">+ Add Muscle</Text>
//                                     </Pressable>

//                                     <Pressable
//                                         className="bg-red-500 rounded px-2 py-1 self-start"
//                                         onPress={() => deleteExercise(i, j)}
//                                     >
//                                         <Text className="text-white text-xs">Delete Exercise</Text>
//                                     </Pressable>
//                                 </View>
//                             ))}


//                             <Pressable
//                                 className="bg-green-600 rounded px-4 py-2"
//                                 onPress={() => addExercise(i)}
//                             >
//                                 <Text className="text-white text-sm">+ Add Exercise</Text>
//                             </Pressable>