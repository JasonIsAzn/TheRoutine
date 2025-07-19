import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { fetchBaseExercises } from '../../../api/baseExercise';
import { addSessionExercise, fetchSessionExercises } from '../../../api/workoutSessionExercise';
import { BaseExercise } from 'types/workout';

type NewSessionExerciseInput = {
    workoutSessionId: number;
    name: string;
    muscles: string[];
    isOptional: boolean;
    isCompleted: boolean;
    isSkipped: boolean;
    isDeleted: boolean;
    order: number;
    weight: number | null;
    baseExerciseId: number | null;
};


export default function AddExerciseToSession() {
    const { sessionId, order } = useLocalSearchParams();
    const parsedSessionId = parseInt(sessionId as string, 10);
    const parsedOrder = parseInt(order as string, 10);


    const [baseExercises, setBaseExercises] = useState<BaseExercise[]>([]);
    const [showAddForm, setShowAddForm] = useState(true);

    const [newExerciseDraft, setNewExerciseDraft] = useState<{
        name: string;
        muscles: string[];
        useBaseSelect: boolean;
        baseExerciseId: number | null;
        order: number;
    }>({
        name: '',
        muscles: [''],
        useBaseSelect: false,
        baseExerciseId: null,
        order: parsedOrder || 0,
    });

    useEffect(() => {
        const loadBase = async () => {
            const res = await fetchBaseExercises();
            setBaseExercises(res);
        };
        loadBase();
    }, []);

    const handleAdd = async () => {
        const newExercise: Partial<NewSessionExerciseInput> = {
            workoutSessionId: parsedSessionId,
            name: newExerciseDraft.name,
            muscles: newExerciseDraft.muscles.filter((m) => m.trim() !== ''),
            isOptional: true,
            isCompleted: false,
            isSkipped: false,
            isDeleted: false,
            order: newExerciseDraft.order,
            weight: null,
            baseExerciseId: newExerciseDraft.baseExerciseId ?? null,
        };

        console.log('Adding new exercise:', newExercise);
        const created = await addSessionExercise(newExercise);
        const updated = await fetchSessionExercises(Number(sessionId));


        console.log('Exercise added:', created);
        console.log('Updated session exercises:', updated);

        // Update parent screen via context or refetch, as needed

        router.back();
    };

    return (
        <View className="flex-1 justify-end">
            <ScrollView className="bg-white rounded-t-2xl p-6">
                <Text className="text-lg font-bold mb-4">Add Exercise to Session</Text>

                {/* Use Base Toggle */}
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
                        className="border border-gray-300 rounded px-3 py-2 mb-2"
                        placeholder="Exercise name"
                        value={newExerciseDraft.name}
                        onChangeText={(text) =>
                            setNewExerciseDraft((prev) => ({ ...prev, name: text }))
                        }
                    />
                )}

                {/* Muscles */}
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

                {/* Submit Buttons */}
                <View className="flex-row justify-end">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <Text className="text-gray-500">Cancel</Text>
                    </Pressable>
                    <Pressable onPress={handleAdd} className="bg-green-600 px-4 py-2 rounded">
                        <Text className="text-white font-bold">Save Exercise</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
