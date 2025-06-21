import api from './index';

export const fetchWorkoutSessionByDate = async (userId: number, date: string) => {
    const response = await api.get('/workoutsessionapi/by-date', {
        params: { userId, date }
    });
    return response.data;
};

export const createWorkoutSession = async (data: {
    userId: number;
    workoutCycleId: number;
    cycleDayIndex: number;
    date: string; // ISO format
}) => {
    const response = await api.post('/workoutsessionapi', data);
    return response.data;
};

export const deleteWorkoutSession = async (sessionId: number) => {
    const response = await api.delete(`/workoutsessionapi/${sessionId}`);
    return response.data;
};
