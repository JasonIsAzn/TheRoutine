import api from './index';

export const fetchSessionExercises = async (sessionId: number) => {
    const response = await api.get('/workoutsessionexerciseapi/by-session', {
        params: { sessionId }
    });
    return response.data;
};

export const addSessionExercise = async (exercise: any) => {
    const response = await api.post('/workoutsessionexerciseapi', exercise);
    return response.data;
};

export const toggleCompleteExercise = async (exerciseId: number) => {
    const response = await api.put(`/workoutsessionexerciseapi/${exerciseId}/toggle-complete`);
    return response.data;
};

export const toggleSkipExercise = async (exerciseId: number) => {
    const response = await api.put(`/workoutsessionexerciseapi/${exerciseId}/toggle-skip`);
    return response.data;
};

export const updateExerciseOrder = async (exerciseId: number, newOrder: number) => {
    const response = await api.put(`/workoutsessionexerciseapi/${exerciseId}/order`, newOrder);
    return response.data;
};

export const softDeleteExercise = async (exerciseId: number) => {
    const response = await api.put(`/workoutsessionexerciseapi/${exerciseId}/soft-delete`);
    return response.data;
};

export const updateExerciseDetails = async (exerciseId: number, updates: any) => {
    const response = await api.put(`/workoutsessionexerciseapi/${exerciseId}/update`, updates);
    return response.data;
};
