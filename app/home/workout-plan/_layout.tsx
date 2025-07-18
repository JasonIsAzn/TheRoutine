import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Stack, usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function WorkoutPlanLayout() {
    const router = useRouter();
    const pathname = usePathname();
    console.log('WorkoutPlanLayout pathname:', pathname);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create"

                options={{
                    title: '',
                    headerBackTitle: 'Home',
                    headerTintColor: '#FFD124',
                    headerStyle: {
                        backgroundColor: '#F5F5F7',
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => router.dismiss()}>
                            <Text className="text-primary text-2xl">Home</Text>
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name="workout-session"
                options={{
                    title: '',
                    headerBackTitle: 'Home',
                    headerTintColor: '#FFD124',
                    headerStyle: {
                        backgroundColor: '#F5F5F7',
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => router.dismiss()}>
                            <Text className="text-primary text-2xl">Home</Text>
                        </Pressable>
                    ),
                    headerRight: () =>
                    (
                        <View className="flex-row gap-x-2 mr-2">
                            <Pressable
                                onPress={() =>
                                    router.push('/home/workout-plan/workout-calendar')
                                }
                                className="px-2 py-1"
                            >
                                <FontAwesomeIcon
                                    icon={['fas', 'calendar']}
                                    size={18}
                                    color="#FFD124"
                                />
                            </Pressable>
                            <Pressable
                                onPress={() =>
                                    router.push('/home/workout-plan/workout-plan-info')
                                }
                                className="px-2 py-1"
                            >
                                <FontAwesomeIcon
                                    icon={['fas', 'gear']}
                                    size={18}
                                    color="#FFD124"
                                />
                            </Pressable>
                        </View>
                    ),
                }}
            />


            <Stack.Screen
                name="workout-plan-info"
                options={{
                    title: '',
                    headerBackTitle: 'Back',
                    headerTintColor: '#FFD124',
                    headerStyle: {
                        backgroundColor: '#F5F5F7',
                    },
                    headerShadowVisible: false,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/home/workout-plan/update')}
                        >
                            <Text className="text-primary text-2xl">Edit</Text>
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen name="update"
                options={{
                    title: '',
                    presentation: 'modal',
                    headerBackTitle: 'Back',
                    headerTintColor: '#FFD124',
                    headerStyle: {
                        backgroundColor: '#F5F5F7',
                    },
                    headerShadowVisible: false,
                }} />
            <Stack.Screen name="workout-calendar" />

            {/* Modals */}
            <Stack.Screen
                name="workout-session-info"
                options={{
                    presentation: 'modal',
                    title: 'Session',
                }}
            />
            <Stack.Screen
                name="add-exercise"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
