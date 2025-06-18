import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold mb-6">The Routine</Text>

            {/* Link to open modal for user info + logout */}
            <Link
                href="/home/user-info"
                className="mb-6 px-4 py-2 rounded bg-gray-200"
            >
                <Text className="text-black text-center font-medium">👤 View Profile</Text>
            </Link>

            {/* Navigation Links */}
            <View className="space-y-3">
                <Link href="/home/workout-plan">
                    <Text className="text-lg">🏋️ gains</Text>
                </Link>
                <Link href="/home/body-log">
                    <Text className="text-lg">📷 thiccness log</Text>
                </Link>
                <Link href="/home/performance">
                    <Text className="text-lg">📊 PRs</Text>
                </Link>
                <Link href="/home/diet-tracker">
                    <Text className="text-lg">🍽️ big back</Text>
                </Link>
                <Link href="/home/supplement-tracker">
                    <Text className="text-lg">💊 roids</Text>
                </Link>
                <Link href="/home/progress-pictures">
                    <Text className="text-lg">🪞 glow up</Text>
                </Link>
            </View>
        </View>
    );
}
