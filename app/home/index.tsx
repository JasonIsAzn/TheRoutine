import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import MenuSection from '@components/MenuSection';
import MenuItem from '@components/MenuItem';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 p-4 bg-background">
            {/* Navbar */}
            <View className="flex-row justify-between items-center">
                <Text className="text-3xl font-bold">The Routine</Text>
                <Pressable onPress={() => router.push('/home/user-info')}>
                    <FontAwesomeIcon
                        icon={['fas', 'user']}
                        size={24}
                        color={"#FFD124"}
                    />
                </Pressable>
            </View>

            {/* Menu Sections */}
            <ScrollView className="flex-1 mt-8">
                <MenuSection>
                    <Pressable
                        className="mb-2"
                        onPress={() => router.push('/home/workout-plan')}
                    >
                        <MenuItem
                            icon={['fas', 'dumbbell']}
                            label="Gains"
                            showDivider
                        />
                    </Pressable>

                    <Pressable
                        className="mb-2"
                        onPress={() => router.push('/home/body-log')}
                    >
                        <MenuItem
                            icon={['fas', 'camera']}
                            label="Thiccness"
                            showDivider
                        />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/home/performance')}
                    >
                        <MenuItem
                            icon={['fas', 'chart-bar']}
                            label="PRs"
                        />
                    </Pressable>
                </MenuSection>

                <MenuSection>
                    <Pressable
                        className="mb-2"
                        onPress={() => router.push('/home/diet-tracker')}
                    >
                        <MenuItem
                            icon={['fas', 'utensils']}
                            label="Big Back"
                            showDivider
                        />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/home/supplement-tracker')}
                    >
                        <MenuItem
                            icon={['fas', 'pills']}
                            label="Roids"
                        />
                    </Pressable>
                </MenuSection>

                <MenuSection>
                    <Pressable
                        onPress={() => router.push('/home/progress-pictures')}
                    >
                        <MenuItem
                            icon={['fas', 'camera']}
                            label="Glow Up"
                        />
                    </Pressable>
                </MenuSection>
            </ScrollView>
        </SafeAreaView>
    );
}
