import { View, Text, Pressable, Alert } from 'react-native';
import { createWorkoutPlan } from '../../../api/workoutPlan';
import { useAuth } from '../../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function CreateWorkoutPlanScreen() {
    const { user } = useAuth();

    const handleCreate = async () => {
        if (!user) return;

        const payload = {
            userId: user.id,
            name: 'Test Plan',
            splitType: 'Custom 7-Day',
            cycleLength: 7,
            workoutDays: [
                {
                    label: 'Push',
                    order: 0,
                    exercises: [
                        { name: 'Bench Press', muscles: ['chest', 'triceps'], isOptional: false, order: 0 }
                    ]
                },
                {
                    label: 'Pull',
                    order: 1,
                    exercises: [
                        { name: 'Deadlift', muscles: ['back', 'hamstrings'], isOptional: false, order: 0 }
                    ]
                },
                {
                    label: 'Legs',
                    order: 2,
                    exercises: [
                        { name: 'Squats', muscles: ['quads', 'glutes'], isOptional: false, order: 0 }
                    ]
                },
                {
                    label: 'Rest Day 1',
                    order: 3,
                    exercises: []
                },
                {
                    label: 'Upper Body',
                    order: 4,
                    exercises: [
                        { name: 'Overhead Press', muscles: ['shoulders'], isOptional: false, order: 0 }
                    ]
                },
                {
                    label: 'Lower Body',
                    order: 5,
                    exercises: [
                        { name: 'Romanian Deadlift', muscles: ['hamstrings'], isOptional: false, order: 0 }
                    ]
                },
                {
                    label: 'Rest Day 2',
                    order: 6,
                    exercises: []
                }
            ]
        };

        try {
            const result = await createWorkoutPlan(payload);
            await AsyncStorage.setItem('activePlan', JSON.stringify(payload));
            router.replace('/home/workout-plan/workout-session');
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to create plan');
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-white px-4">
            <Text className="text-2xl font-bold mb-6 text-center">
                Create Workout Plan
            </Text>
            <Pressable
                className="bg-green-600 px-6 py-3 rounded"
                onPress={handleCreate}
            >
                <Text className="text-white text-lg font-semibold">
                    Create with Placeholder Plan
                </Text>
            </Pressable>
        </View>
    );
}
