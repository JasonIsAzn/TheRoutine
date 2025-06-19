import api from './index';

export const fetchActiveWorkoutPlan = async (userId: number) => {
    const response = await api.get(`/workoutplanapi/active-plan?userId=${userId}`);
    return response.data;
};

export const createWorkoutPlan = async (planData: any) => {
    const response = await api.post('/workoutplanapi', planData);
    return response.data;
};

export const deactivateWorkoutPlan = async (userId: number) => {
    const response = await api.delete('/workoutplanapi/deactivate', {
        params: { userId }
    });
    return response.data;
};