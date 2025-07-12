import "../global.css";
import "../libs/icons";
import { Slot } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { WorkoutPlanProvider } from "../contexts/WorkoutPlanContext";


export default function RootLayout() {
    return (
        <AuthProvider>
            <WorkoutPlanProvider>
                <Slot />
            </WorkoutPlanProvider>
        </AuthProvider>
    );
}