import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchActiveWorkoutPlan } from '../api/workoutPlan';
import { useAuth } from '../contexts/AuthContext';

export const useWorkoutPlan = () => {
    const { user } = useAuth();
    const [plan, setPlan] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlan = async () => {
            const stored = await AsyncStorage.getItem('activePlan');
            if (stored) {
                setPlan(JSON.parse(stored));
                setLoading(false);
                return;
            }

            if (user) {
                try {
                    const data = await fetchActiveWorkoutPlan(user.id);
                    setPlan(data);
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
