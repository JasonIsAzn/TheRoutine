import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { deactivateWorkoutPlan } from '../../../api/workoutPlan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

export default function WorkoutPlanInfoModal() {
    const { plan, loading } = useWorkoutPlan();
    const { user } = useAuth();

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

    if (loading || !plan) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading plan...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-2">{plan.name}</Text>
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
        </ScrollView>
    );
}
