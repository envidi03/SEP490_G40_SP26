import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/src/components/ui/themed-text';
import { AppointmentCard } from '@/src/components/features/appointments/AppointmentCard';
import type { Appointment } from '@/src/components/features/appointments/AppointmentCard';
import { usePatientAppointments } from '@/src/hooks/useHomeData';

type FilterKey = 'week' | 'month' | 'year';

const FILTERS: { key: FilterKey; label: string; days: number }[] = [
    { key: 'week', label: '1 tuần', days: 7 },
    { key: 'month', label: '1 tháng', days: 30 },
    { key: 'year', label: '1 năm', days: 365 },
];

function getDateRange(days: number): { gte_date: string; lte_date: string } {
    const now = new Date();
    const lte = new Date(now);
    const gte = new Date(now);
    gte.setDate(gte.getDate() - days);
    return {
        gte_date: gte.toISOString(),
        lte_date: lte.toISOString(),
    };
}

function SkeletonCard() {
    return (
        <View style={styles.skeletonCard}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '50%', marginTop: 10 }]} />
            <View style={[styles.skeletonLine, { width: '70%', marginTop: 20 }]} />
        </View>
    );
}

export function AppointmentListScreen() {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState<FilterKey>('month');

    const selectedFilter = FILTERS.find(f => f.key === activeFilter)!;
    const { gte_date, lte_date } = useMemo(
        () => getDateRange(selectedFilter.days),
        [activeFilter]
    );

    const { data, isLoading, isError, refetch } = usePatientAppointments({
        gte_date,
        lte_date,
        sort: 'desc',
        limit: 50,
    });

    const appointments: Appointment[] = data?.data || [];

    return (
        <SafeAreaProvider style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <ThemedText style={styles.headerTitle}>Lịch hẹn của tôi</ThemedText>
                <ThemedText style={styles.headerSub}>
                    Lịch sử các cuộc hẹn khám nha khoa
                </ThemedText>

                {/* Filter Chips */}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterChip,
                                activeFilter === f.key && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveFilter(f.key)}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.filterChipText,
                                    activeFilter === f.key && styles.filterChipTextActive,
                                ]}
                            >
                                {f.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.listContent}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : isError ? (
                <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyTitle}>Không thể tải dữ liệu</ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
                        <ThemedText style={styles.retryText}>Thử lại</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyTitle}>Không có lịch hẹn</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>
                        Không tìm thấy lịch hẹn nào trong{' '}
                        {selectedFilter.label.toLowerCase()} qua
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <AppointmentCard appointment={item} />}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 24 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <ThemedText style={styles.countText}>
                            {appointments.length} lịch hẹn trong {selectedFilter.label.toLowerCase()} qua
                        </ThemedText>
                    }
                />
            )}
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F6FF',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#dbeafe',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1e3a8a',
        letterSpacing: -0.5,
        marginBottom: 4,
        paddingTop: 17,
    },
    headerSub: {
        fontSize: 13,
        color: '#60a5fa',
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        borderWidth: 1.5,
        borderColor: '#bfdbfe',
    },
    filterChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3b82f6',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    countText: {
        fontSize: 13,
        color: '#60a5fa',
        fontWeight: '600',
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e3a8a',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#60a5fa',
        textAlign: 'center',
        lineHeight: 20,
    },
    skeletonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#dbeafe',
        height: 130,
    },
    skeletonLine: {
        height: 14,
        borderRadius: 7,
        backgroundColor: '#dbeafe',
        width: '90%',
    },
    retryBtn: {
        marginTop: 12,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#2563EB',
        borderRadius: 12,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
