import WorkoutSessionScreen from './workout-session';
import CreateWorkoutPlanScreen from './create';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { ActivityIndicator, Text, View } from 'react-native';

export default function WorkoutPlanIndex() {
    const { plan, loading } = useWorkoutPlan();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
                <Text>Loading plan...</Text>
            </View>
        );
    }
    if (plan) {
        return <WorkoutSessionScreen />;
    } else {
        return <CreateWorkoutPlanScreen />;
    }
}