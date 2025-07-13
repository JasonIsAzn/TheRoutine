import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WorkoutExercise } from 'types/workout';

interface EditableWorkoutDay {
    label: string;
    order: number;
    selected: boolean;
    exercises: WorkoutExercise[];
    isEditing?: boolean;
}

interface WorkoutPlanContextType {
    days: EditableWorkoutDay[];
    setDays: React.Dispatch<React.SetStateAction<EditableWorkoutDay[]>>;
    addExerciseToDay: (dayIndex: number, ex: WorkoutExercise) => void;
    resetWorkoutPlan: () => void;
}

const WorkoutPlanContext = createContext<WorkoutPlanContextType | undefined>(undefined);

export const WorkoutPlanProvider = ({ children }: { children: ReactNode }) => {
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [days, setDays] = useState<EditableWorkoutDay[]>(
        fullDayNames.map((day, i) => ({
            order: i,
            selected: false,
            label: `Default ${day} Name`,
            exercises: [],
        }))
    );

    const addExerciseToDay = (dayIndex: number, ex: WorkoutExercise) => {
        setDays(prev =>
            prev.map((d, i) =>
                i === dayIndex
                    ? { ...d, exercises: [...d.exercises, ex] }
                    : d
            )
        );
    };

    const resetWorkoutPlan = () => {
        setDays(fullDayNames.map((day, i) => ({
            order: i,
            selected: false,
            label: `Default ${day} Name`,
            exercises: [],
        })));
    };


    return (
        <WorkoutPlanContext.Provider value={{ days, setDays, addExerciseToDay, resetWorkoutPlan }}>
            {children}
        </WorkoutPlanContext.Provider>
    );
};

export const useWorkoutPlan = () => {
    const context = useContext(WorkoutPlanContext);
    if (!context) {
        throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
    }
    return context;
};
