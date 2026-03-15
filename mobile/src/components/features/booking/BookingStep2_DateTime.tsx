import { useMemo, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { BookingState } from '@/src/screens/booking/BookingScreen';
import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';

type Props = {
    bookingData: BookingState;
    setBookingData: React.Dispatch<React.SetStateAction<BookingState>>;
};

// Generate next 14 days
const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        days.push(addDays(today, i));
    }
    return days;
};

// Simple 30-min interval slots from 08:30 to 17:00
const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 8;
    let currentMinute = 30;

    while (currentHour < 17 || (currentHour === 17 && currentMinute === 0)) {
        const h = currentHour.toString().padStart(2, '0');
        const m = currentMinute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);

        currentMinute += 30;
        if (currentMinute >= 60) {
            currentHour += 1;
            currentMinute = 0;
        }
    }
    return slots;
};

export function BookingStep2_DateTime({ bookingData, setBookingData }: Props) {
    const dates = useMemo(() => generateDays(), []);
    const timeSlots = useMemo(() => generateTimeSlots(), []);

    // Auto-select today as the default date when the component mounts (if no date selected yet)
    useEffect(() => {
        if (!bookingData.selectedDate && dates.length > 0) {
            setBookingData(prev => ({
                ...prev,
                selectedDate: format(dates[0], 'yyyy-MM-dd')
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps: run once on mount

    const handleSelectDate = (date: Date) => {
        setBookingData(prev => ({
            ...prev,
            selectedDate: format(date, 'yyyy-MM-dd')
        }));
    };

    const handleSelectTime = (time: string) => {
        setBookingData(prev => ({
            ...prev,
            selectedTime: time
        }));
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Chọn thời gian khám</ThemedText>
            <ThemedText style={styles.subtitle}>Bác sĩ sẽ liên hệ nếu cần điều chỉnh</ThemedText>

            {/* Date Selector */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Chọn ngày</ThemedText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateScrollContent}
                >
                    {dates.map((date, index) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = bookingData.selectedDate === dateStr;
                        const dayOfWeek = index === 0 ? 'Hôm nay' : format(date, 'EEEE', { locale: vi });
                        const dayOfMonth = format(date, 'dd/MM');

                        return (
                            <TouchableOpacity
                                key={dateStr}
                                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                onPress={() => handleSelectDate(date)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.dayOfWeek, isSelected && styles.textSelected]}>
                                    {dayOfWeek}
                                </ThemedText>
                                <ThemedText style={[styles.dayOfMonth, isSelected && styles.textSelected]}>
                                    {dayOfMonth}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Time Slots Grid */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Chọn giờ</ThemedText>
                <View style={styles.timeGrid}>
                    {timeSlots.map((time) => {
                        const isSelected = bookingData.selectedTime === time;
                        return (
                            <TouchableOpacity
                                key={time}
                                style={[styles.timeCard, isSelected && styles.timeCardSelected]}
                                onPress={() => handleSelectTime(time)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.timeText, isSelected && styles.textSelected]}>
                                    {time}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={{ height: 40 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    dateScrollContent: {
        gap: 12,
        paddingRight: 24,
    },
    dateCard: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    dateCardSelected: {
        borderColor: '#111827',
        backgroundColor: '#111827',
    },
    dayOfWeek: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    dayOfMonth: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    textSelected: {
        color: '#FFFFFF',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    timeCard: {
        width: '30%', // roughly 3 items per row with gap
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    timeCardSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    timeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    }
});
