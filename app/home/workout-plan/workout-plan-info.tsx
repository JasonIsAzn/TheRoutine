import { Pressable, ScrollView, Text, View } from 'react-native';
import { useWorkoutPlan } from '../../../hooks/useWorkoutPlan';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { WorkoutDay } from 'types/workout';


const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutPlanInfoScreen() {
    const { plan, loading, reloadPlan } = useWorkoutPlan();
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

    useFocusEffect(
        useCallback(() => {
            reloadPlan();
        }, [])
    );

    useEffect(() => {
        if (plan) {
            const todayIndex = new Date().getDay();
            const expanded = new Set<number>();

            const today = plan.workoutDays.find((day: WorkoutDay) => day.order === todayIndex);
            if (today && today.exercises.length > 0) {
                const index = plan.workoutDays.findIndex((day: WorkoutDay) => day.order === todayIndex);
                if (index !== -1) expanded.add(index);
            }

            setExpandedDays(expanded);
        }
    }, [plan]);

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
        <ScrollView className="flex-1 bg-background p-4">
            <Text className="text-2xl font-bold mb-12">{plan.name}</Text>

            {plan.workoutDays.map((day: any, i: number) => (
                <View key={day.order} className="mb-5">
                    <View className="w-full mb-5 flex-row items-center">
                        {day.exercises.length > 0 ? (
                            <>
                                {/* Chevron – 10% width */}
                                <Pressable onPress={() => toggleExpandDay(i)} className="w-[10%] items-start justify-center py-1">
                                    <FontAwesomeIcon
                                        icon={['fas', expandedDays.has(i) ? 'chevron-up' : 'chevron-down']}
                                        size={18}
                                        color="#000"
                                    />
                                </Pressable>

                                {/* Day Label – flex-1 */}
                                <View className="flex-1 pr-2">
                                    <Text
                                        className="font-bold text-[18px] leading-[22px]"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {day.label}
                                    </Text>
                                </View>

                                {/* Day Name – 20% width */}
                                <View className="w-[20%] items-end">
                                    <Text className="text-gray font-semibold text-sm">
                                        {fullDayNames[day.order]}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            // Rest Day layout (centered)
                            <View className="flex-1 items-center">
                                <Text className="text-sm font-semibold text-gray">
                                    {day.label} – {fullDayNames[day.order]}
                                </Text>
                            </View>
                        )}
                    </View>

                    {expandedDays.has(i) && (
                        <>
                            {day.exercises.map((ex: any, j: number) => (
                                <View key={j} className="flex-row items-center justify-between mb-3 ml-10">
                                    <View>
                                        <Text className="text-base font-semibold">{ex.name}</Text>
                                        <Text className="text-gray-500 text-sm">{ex.muscles.join(', ')}</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            ))}

            <View className="mb-32"></View>
        </ScrollView>
    );
}
