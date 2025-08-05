import api from './index';

export const fetchActiveWorkoutCycle = async (userId: number) => {
    const response = await api.get(`/workoutcycleapi/active`, {
        params: {
            userId,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        }
    });
    return response.data;
};

export const createWorkoutCycle = async (cycleData: {
    userId: number;
    workoutPlanId: number;
    startDate: Date;
}) => {
    const response = await api.post(`/workoutcycleapi`, {
        ...cycleData,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
    return response.data;
};

export const deactivateWorkoutCycle = async (userId: number) => {
    const response = await api.post(`/workoutcycleapi/deactivate`, null, {
        params: { userId }
    });
    return response.data;
};

export const updateWorkoutCyclePlanId = async (userId: number, newWorkoutPlanId: number) => {
    const response = await api.post(`/workoutcycleapi/update-plan-id`, {
        userId,
        newWorkoutPlanId
    });
    return response.data;
}

