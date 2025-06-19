import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';

export default function WorkoutPlanIndex() {
    const { plan, loading } = useWorkoutPlan();
    const router = useRouter();

    useEffect(() => {
        console.log("Plan index loaded");
        console.log('Loading:', loading);
        if (!loading) {
            if (plan) {
                console.log('Plan exists, redirecting to workout session');
                router.replace('/home/workout-plan/workout-session');
            } else {
                console.log('No plan found, redirecting to create workout plan');
                router.replace('/home/workout-plan/create');
            }
            console.log('Plan:', plan);
        }
    }, [loading, plan]);

    return null;
}
