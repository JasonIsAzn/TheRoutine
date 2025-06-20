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

export const swapWorkoutCycleDays = async (cycleId: number, dayOrderMap: number[]) => {
    const response = await api.patch(`/workoutcycleapi/${cycleId}/swap-days`, {
        dayOrderMap
    });
    return response.data;
};
