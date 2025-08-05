import api from './index';

export const fetchWorkoutSessionByDate = async (userId: number, date: string) => {
    const response = await api.get('/workoutsessionapi/by-date', {
        params: {
            userId,
            date,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        }
    });
    return response.data;
};

export const createWorkoutSession = async (data: {
    userId: number;
    workoutCycleId: number;
    cycleDayIndex: number;
    date: string; // ISO format
}) => {
    const response = await api.post('/workoutsessionapi', {
        ...data,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
    return response.data;
};

export const deleteWorkoutSession = async (sessionId: number) => {
    const response = await api.delete(`/workoutsessionapi/${sessionId}`);
    return response.data;
};


export const markWorkoutSessionAsCompleted = async (sessionId: number) => {
    const response = await api.patch(`/workoutsessionapi/${sessionId}/mark-complete`);
    return response.data;
};


export const fetchAllWorkoutSessions = async (userId: number) => {
    const response = await api.get('/workoutsessionapi/all', {
        params: { userId }
    });
    return response.data;
};

export const fetchWorkoutSessionById = async (sessionId: number) => {
    const response = await api.get('/workoutsessionapi/by-id', {
        params: { sessionId }
    });
    return response.data;
};
