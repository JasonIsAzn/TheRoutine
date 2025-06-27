import api from './index';

export const fetchBaseExercises = async () => {
    const response = await api.get(`/baseexerciseapi`);
    return response.data;
};
