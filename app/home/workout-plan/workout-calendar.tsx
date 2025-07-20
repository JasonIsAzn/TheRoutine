import React, { JSX, useEffect, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { fetchAllWorkoutSessions } from '../../../api/workoutSession';
import { fetchAllWorkoutPlans } from '../../../api/workoutPlan';
import { useAuth } from '../../../contexts/AuthContext';

export default function WorkoutSessionScreen() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const [sessionsResult, plansResult] = await Promise.all([
                    fetchAllWorkoutSessions(user.id),
                    fetchAllWorkoutPlans(user.id),
                ]);
                setSessions(sessionsResult);
                setPlans(plansResult);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const getSessionForDate = (dateStr: string) => {
        return sessions.find((s) => s.date.startsWith(dateStr));
    };

    const renderCalendar = (baseDate: Date) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const monthLabel = baseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0

        const weeks: JSX.Element[][] = [];
        let currentWeek: JSX.Element[] = [];

        const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayRow = (
            <View key={`weekday-${month}`} className="flex-row justify-between mb-2">
                {weekdayLabels.map((day, idx) => (
                    <Text key={idx} className="w-12 text-center font-bold text-gray-600">
                        {day}
                    </Text>
                ))}
            </View>
        );

        for (let i = 0; i < firstDay; i++) {
            currentWeek.push(<View key={`blank-start-${i}`} className="w-12 h-12 m-1" />);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dateStr = dayDate.toISOString().split('T')[0];
            const session = getSessionForDate(dateStr);
            const isCompleted = session?.isCompleted;
            const isToday = dayDate.toDateString() === new Date().toDateString();

            const baseStyle = isCompleted ? 'bg-yellow-400' : 'bg-gray-200';
            const borderStyle = isToday ? 'border-2 border-yellow-400' : '';

            currentWeek.push(
                <Pressable
                    key={i}
                    onPress={() => {
                        if (session) {
                            router.push({
                                pathname: '/home/workout-plan/workout-session-info',
                                params: { sessionId: session.id },
                            });
                        }
                    }}
                    className={`w-12 h-12 m-1 justify-center items-center rounded ${baseStyle} ${borderStyle}`}
                >
                    <Text>{i}</Text>
                </Pressable>
            );

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        while (currentWeek.length < 7) {
            currentWeek.push(<View key={`blank-end-${currentWeek.length}`} className="w-12 h-12 m-1" />);
        }
        weeks.push(currentWeek);

        return (
            <View key={monthLabel} className="mb-6">
                <Text className="text-lg font-bold mb-1">{monthLabel}</Text>
                {weekdayRow}
                {weeks.map((week, idx) => (
                    <View key={`week-${idx}`} className="flex-row justify-between">
                        {week}
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const getStartMonth = () => {
        if (!sessions.length) return new Date();
        const minSession = sessions.reduce((min, s) =>
            new Date(s.date) < new Date(min.date) ? s : min
        );
        return new Date(minSession.date);
    };

    const startDate = getStartMonth();
    const currentDate = new Date();
    const monthsToShow: Date[] = [];

    const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    let iterMonth = new Date(startMonth);
    while (iterMonth <= endMonth) {
        monthsToShow.push(new Date(iterMonth));
        iterMonth.setMonth(iterMonth.getMonth() + 1);
    }

    const displayedMonths = monthsToShow.map((date) => renderCalendar(date));

    return (
        <ScrollView className="flex-1 p-4 bg-background">
            <Text className="text-xl font-bold mb-4">Your Sessions</Text>
            {displayedMonths}

            <Text className="text-xl font-bold mt-6 mb-2">Workout Plan History</Text>

            {Object.values(
                plans.reduce((acc: Record<number, any[]>, plan) => {
                    const groupId = plan.planGroupId;
                    if (!acc[groupId]) acc[groupId] = [];
                    acc[groupId].push(plan);
                    return acc;
                }, {})
            ).map((group: any[]) => {
                const sortedGroup = group.sort((a, b) => a.version - b.version);
                const first = sortedGroup[0];
                const last = sortedGroup[sortedGroup.length - 1];

                return (
                    <View key={first.planGroupId} className="mb-4">
                        <Text className="font-semibold">
                            {first.name} —{" "}
                            {new Date(first.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}{" "}
                            to{" "}
                            {last.endedAt
                                ? new Date(last.endedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : 'Present'}
                        </Text>

                        {group.length > 1 &&
                            sortedGroup.map((version) => (
                                <Pressable
                                    key={version.id}
                                    onPress={() =>
                                        console.log(`Pressed version ${version.version}, id: ${version.id}`)
                                    }
                                    className="ml-4 mt-1"
                                >
                                    <Text className="text-gray-700">
                                        • Version {version.version} —{" "}
                                        {new Date(version.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}{" "}
                                        to{" "}
                                        {version.endedAt
                                            ? new Date(version.endedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : 'Present'}
                                    </Text>
                                </Pressable>
                            ))}
                    </View>
                );
            })}
        </ScrollView>
    );
}
