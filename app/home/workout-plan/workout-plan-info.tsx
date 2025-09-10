import { Pressable, ScrollView, Text, View } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { WorkoutDay } from 'types/workout';


const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutPlanInfoScreen() {
    const router = useRouter();
    const { plan, loading, reloadPlan } = useWorkoutPlan();
    const [expandedDays, setExpandedDays] = useState<Set<number>>(
        new Set(fullDayNames.map((_, i) => i))
    );

    useFocusEffect(
        useCallback(() => {
            reloadPlan();
        }, [])
    );

    const toggleExpandDay = (index: number) => {
        setExpandedDays(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    if (loading || !plan) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading plan...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-background">
            <View className='flex-row mt-4'>
                <Text className="text-2xl font-bold mb-3 mx-4">{plan.name}</Text>
                <Pressable
                    onPress={() => router.push('/home/workout-plan/update')}
                >
                    <Text className="text-primary text-2xl">Edit</Text>
                </Pressable>
            </View>

            {plan.workoutDays.map((day: any, i: number) => (
                <View key={day.order}>
                    {day.exercises.length > 0 && (
                        <Pressable onPress={() => toggleExpandDay(i)} className="w-full mt-5 flex-row items-center">
                            {/* Chevron – 10% width */}
                            <View className="w-[10%] justify-center py-1 items-center">
                                <FontAwesomeIcon
                                    icon={['fas', expandedDays.has(i) ? 'chevron-up' : 'chevron-down']}
                                    size={18}
                                    color="#000"
                                />
                            </View>

                            {/* Day Label – flex-1 */}
                            <View className="flex-1 pr-2">
                                <Text
                                    className="font-semibold text-xl leading-[22px]"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {day.label}
                                </Text>
                            </View>

                            {/* Day Name – 20% width */}
                            <View className="w-[20%] items-end">
                                <Text className="text-gray font-semibold text-sm pr-4">
                                    {fullDayNames[day.order]}
                                </Text>
                            </View>
                        </Pressable>

                    )}

                    {expandedDays.has(i) && (
                        <>
                            {day.exercises.map((ex: any, j: number) => (
                                <View
                                    key={j}
                                    className={`flex-row items-center mb-3 ${j === 0 ? 'mt-3' : ''}`}
                                >
                                    {/* Circle – same width as chevron (10%) */}
                                    <View className="w-[10%] items-center justify-center bg-yellow-400">

                                    </View>

                                    {/* Exercise name – fill remaining space */}
                                    <View className="flex-1 flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-black mr-5" />
                                        <Text className="text-lg">{ex.name}</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            ))}

            <View className="mb-24"></View>
        </ScrollView>
    );
}
