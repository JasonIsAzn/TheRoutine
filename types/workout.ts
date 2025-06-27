export interface WorkoutExercise {
    name: string;
    muscles: string[];
    isOptional: boolean;
    order: number;
    useBaseSelect?: boolean;
    baseExerciseId?: number;
}

export interface WorkoutDay {
    label: string;
    order: number;
    exercises: WorkoutExercise[];
}

export interface BaseExercise {
    id: number;
    name: string;
    muscles: string[];
    equipment?: string;
}
