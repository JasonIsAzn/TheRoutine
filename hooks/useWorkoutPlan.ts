import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchActiveWorkoutPlan } from '../api/workoutPlan';
import { useAuth } from '../contexts/AuthContext';

export const useWorkoutPlan = () => {
    const { user } = useAuth();
    const [plan, setPlan] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('useWorkoutPlan effect triggered');
        const loadPlan = async () => {
            const stored = await AsyncStorage.getItem('activePlan');
            if (stored) {
                setPlan(JSON.parse(stored));
                setLoading(false);
                console.log('Loaded plan from storage:', JSON.parse(stored));
                return;
            }

            if (user) {
                console.log('Fetching active workout plan for user:', user.id);
                try {
                    const data = await fetchActiveWorkoutPlan(user.id);
                    setPlan(data);
                    console.log('Fetched plan from API:', data);
                    await AsyncStorage.setItem('activePlan', JSON.stringify(data));
                } catch (err) {
                    console.log('No active plan found:', err);
                }
            }
            setLoading(false);
        };
        loadPlan();
    }, [user]);

    return { plan, loading };
};
