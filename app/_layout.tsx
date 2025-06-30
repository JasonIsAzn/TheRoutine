import "../global.css";
import "../libs/icons";
import { Slot } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";


export default function RootLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}