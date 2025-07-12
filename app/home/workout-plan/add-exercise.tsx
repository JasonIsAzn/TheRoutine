import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { fetchBaseExercises } from '../../../api/baseExercise';
import { WorkoutExercise, BaseExercise } from 'types/workout';
import { useWorkoutPlan } from '../../../contexts/WorkoutPlanContext';


export default function AddExerciseScreen() {
    const { dayIndex } = useLocalSearchParams();
    const activeDayIndex = parseInt(dayIndex as string, 10);

    const { addExerciseToDay } = useWorkoutPlan();

    const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);
    const [newExercise, setNewExercise] = useState<WorkoutExercise>({
        name: '',
        muscles: [''],
        isOptional: false,
        order: 0,
        useBaseSelect: false,
        baseExerciseId: undefined,
    });

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

    const handleAddExercise = () => {
        addExerciseToDay(activeDayIndex, newExercise);

        router.back();
    };

    return (
        <View className="flex-1 justify-end">
            <ScrollView className="bg-white rounded-t-2xl p-6 ">
                <Text className="text-lg font-bold mb-4">Add Exercise</Text>

                {/* Toggle Use Base */}
                <View className="flex-row mb-2 items-center">
                    <Text className="mr-2">Use Base:</Text>
                    <Pressable
                        className={`px-3 py-1 rounded ${newExercise.useBaseSelect ? 'bg-green-600' : 'bg-gray-400'}`}
                        onPress={() =>
                            setNewExercise(prev => ({
                                ...prev,
                                useBaseSelect: !prev.useBaseSelect,
                            }))
                        }
                    >
                        <Text className="text-black">{newExercise.useBaseSelect ? 'ON' : 'OFF'}</Text>
                    </Pressable>
                </View>

                {/* Picker or Manual Input */}
                {newExercise.useBaseSelect ? (
                    <View className="border border-gray-300 rounded mb-2">
                        <Picker
                            selectedValue={newExercise.baseExerciseId ?? ''}
                            onValueChange={(baseId) => {
                                const selected = baseExercises.find(b => b.id === baseId);
                                if (selected) {
                                    setNewExercise({
                                        ...newExercise,
                                        baseExerciseId: selected.id,
                                        name: selected.name,
                                        muscles: selected.muscles,
                                    });
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
                        className="border border-gray-300 rounded px-3 py-2 mb-2"
                        placeholder="Exercise name"
                        value={newExercise.name}
                        onChangeText={(text) =>
                            setNewExercise(prev => ({ ...prev, name: text }))
                        }
                    />
                )}

                {/* Muscle Fields */}
                {newExercise.muscles.map((muscle, index) => (
                    <View key={index} className="flex-row items-center mb-1">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2"
                            placeholder={`Muscle ${index + 1}`}
                            value={muscle}
                            onChangeText={(text) =>
                                setNewExercise(prev => {
                                    const updated = [...prev.muscles];
                                    updated[index] = text;
                                    return { ...prev, muscles: updated };
                                })
                            }
                        />
                        <Pressable
                            onPress={() =>
                                setNewExercise(prev => ({
                                    ...prev,
                                    muscles: prev.muscles.filter((_, i) => i !== index),
                                }))
                            }
                            className="w-8 h-8 bg-red-500 rounded justify-center items-center"
                        >
                            <Text className="text-white font-bold">X</Text>
                        </Pressable>
                    </View>
                ))}

                <Pressable
                    className="bg-blue-600 px-3 py-2 rounded self-start mb-4"
                    onPress={() =>
                        setNewExercise(prev => ({
                            ...prev,
                            muscles: [...prev.muscles, ''],
                        }))
                    }
                >
                    <Text className="text-white text-xs">+ Add Muscle</Text>
                </Pressable>

                <View className="flex-row justify-end">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <Text className="text-gray-500">Cancel</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleAddExercise}
                        className="bg-green-600 px-4 py-2 rounded"
                    >
                        <Text className="text-white font-bold">Add Exercise</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
