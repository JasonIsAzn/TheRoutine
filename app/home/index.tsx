import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import MenuSection from '@components/MenuSection';
import MenuItem from '@components/MenuItem';

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 p-4 bg-background">
            {/* Navbar */}
            <View className="flex-row justify-between items-center">
                <Text className="text-3xl font-bold">The Routine</Text>
                <Link href="/home/user-info">
                    <FontAwesomeIcon icon={['fas', 'user']} size={24} color={"#FFD124"} />
                </Link>
            </View>

            {/* Menu Sections */}
            <ScrollView className="flex-1 mt-8">
                <MenuSection>
                    <MenuItem href="/home/workout-plan" icon={['fas', 'dumbbell']} label="Gains" showDivider />
                    <MenuItem href="/home/body-log" icon={['fas', 'camera']} label="Thiccness" showDivider />
                    <MenuItem href="/home/performance" icon={['fas', 'chart-bar']} label="PRs" />
                </MenuSection>

                <MenuSection>
                    <MenuItem href="/home/diet-tracker" icon={['fas', 'utensils']} label="Big Back" showDivider />
                    <MenuItem href="/home/supplement-tracker" icon={['fas', 'pills']} label="Roids" />
                </MenuSection>

                <MenuSection>
                    <MenuItem href="/home/progress-pictures" icon={['fas', 'camera']} label="Glow Up" />
                </MenuSection>
            </ScrollView>
        </SafeAreaView>
    );
}
