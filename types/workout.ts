export interface WorkoutExercise {
    name: string;
    muscles: string[];
    isOptional: boolean;
    order: number;
}

export interface WorkoutDay {
    label: string;
    order: number;
    exercises: WorkoutExercise[];
}
