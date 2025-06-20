import api from './index';

export const fetchActiveWorkoutCycle = async (userId: number) => {
    const response = await api.get(`/workoutcycleapi/active`, {
        params: { userId }
    });
    return response.data;
};

export const createWorkoutCycle = async (cycleData: {
    userId: number;
    workoutPlanId: number;
    startDate: string; // ISO string (e.g. new Date().toISOString())
}) => {
    console.log('Creating workout cycle with data:', JSON.stringify(cycleData, null, 2));
    const response = await api.post(`/workoutcycleapi`, cycleData);
    return response.data;
};

export const deactivateWorkoutCycle = async (userId: number) => {
    console.log('Deactivating workout cycle for userId:', userId);
    const response = await api.post(`/workoutcycleapi/deactivate`, null, {
        params: { userId }
    });
    return response.data;
};
