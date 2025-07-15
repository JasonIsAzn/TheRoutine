import { Pressable, ScrollView, Text, View } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useRouter } from 'expo-router';


const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutPlanInfoScreen() {
    const { plan, loading } = useWorkoutPlan();
    const router = useRouter();


    if (loading || !plan) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading plan...</Text>
            </View>
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
                    <Text className="text-lg font-semibold">
                        {fullDayNames[day.order]} – {day.label}
                    </Text>
                    {day.exercises.map((exercise: any, index: number) => (
                        <View key={index} className="ml-2 mt-1">
                            <Text className="text-base">• {exercise.name}</Text>
                            <Text className="text-xs text-gray-500">
                                Muscles: {exercise.muscles.join(', ')}
                                {exercise.isOptional ? ' (Optional)' : ''}
                            </Text>
                            {exercise.baseExerciseId && (
                                <Text className="text-[10px] text-gray-400 italic">
                                    Base Exercise ID: {exercise.baseExerciseId}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}
