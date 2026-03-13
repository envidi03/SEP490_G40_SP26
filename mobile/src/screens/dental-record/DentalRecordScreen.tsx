import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useProfileData, useDentalRecordData } from '@/src/hooks/useHomeData';
import { DentalRecordHeader } from '@/src/components/features/dental-record/DentalRecordHeader';
import { PatientSummaryCard } from '@/src/components/features/dental-record/PatientSummaryCard';
import { TreatmentCard } from '@/src/components/features/dental-record/TreatmentCard';
import { EmptyDentalRecord } from '@/src/components/features/dental-record/EmptyDentalRecord';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { Image } from 'expo-image';

const RECORD_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    IN_PROGRESS: { label: 'Đang điều trị', color: '#D97706', bg: '#FFFBEB' },
    COMPLETED: { label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5' },
    CANCELLED: { label: 'Đã huỷ', color: '#DC2626', bg: '#FEF2F2' },
};

function DentalRecordItem({ record }: { record: any }) {
    const [expanded, setExpanded] = useState(false);
    const status = RECORD_STATUS[record.status] || { label: record.status, color: '#6B7280', bg: '#F9FAFB' };

    let startDate = '';
    try {
        if (record.start_date) {
            const d = typeof record.start_date === 'string' ? parseISO(record.start_date) : new Date(record.start_date);
            startDate = format(d, 'dd/MM/yyyy', { locale: vi });
        }
    } catch (e) { console.log(e); }

    const doctorName = record.doctor_info?.profile?.full_name || 'Chưa xác định';
    const treatments = record.treatments || [];

    return (
        <View style={itemStyles.card}>
            {/* Header row */}
            <TouchableOpacity
                style={itemStyles.header}
                onPress={() => setExpanded(p => !p)}
                activeOpacity={0.7}
            >
                <View style={itemStyles.headerLeft}>
                    <ThemedText style={itemStyles.recordName} numberOfLines={2}>{record.record_name}</ThemedText>
                    <ThemedText style={itemStyles.doctorText}>BS. {doctorName}</ThemedText>
                    {!!startDate && (
                        <ThemedText style={itemStyles.dateText}>Bắt đầu: {startDate}</ThemedText>
                    )}
                    {!!record.diagnosis && (
                        <ThemedText style={itemStyles.diagnosisText} numberOfLines={2}>
                            Chẩn đoán: {record.diagnosis}
                        </ThemedText>
                    )}
                </View>
                <View style={itemStyles.headerRight}>
                    <View style={[itemStyles.statusBadge, { backgroundColor: status.bg }]}>
                        <ThemedText style={[itemStyles.statusText, { color: status.color }]}>{status.label}</ThemedText>
                    </View>
                    <Image
                        source={require('@/assets/images/down.png')}
                        style={[
                            itemStyles.chevronIcon,
                            { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }
                        ]}
                        contentFit="contain"
                    />
                </View>
            </TouchableOpacity>

            {/* Collapsed stats */}
            {!expanded && treatments.length > 0 && (
                <View style={itemStyles.collapsedStats}>
                    <ThemedText style={itemStyles.collapsedText}>{treatments.length} phiếu điều trị</ThemedText>
                </View>
            )}

            {/* Expanded treatments */}
            {expanded && (
                <View style={itemStyles.expandedContent}>
                    <TreatmentCard treatments={treatments} />
                    {treatments.length === 0 && (
                        <ThemedText style={itemStyles.noTreatments}>Chưa có phiếu điều trị</ThemedText>
                    )}
                </View>
            )}
        </View>
    );
}

export function DentalRecordScreen() {
    const insets = useSafeAreaInsets();
    const { data: profileData } = useProfileData();
    const { data: recordData, isLoading, refetch, isRefetching } = useDentalRecordData();

    const profile = profileData?.data || {};
    const records: any[] = recordData?.data || [];
    const totalRecords = records.length;
    const lastVisit = records[0]?.start_date;
    const inProgressCount = records.filter(r => r.status === 'IN_PROGRESS').length;
    const completedCount = records.filter(r => r.status === 'COMPLETED').length;

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.inner}>
                    <View style={styles.skeletonCard} />
                    <View style={styles.skeletonList} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1E3A5F" />
                }
            >
                <View style={styles.inner}>
                    <DentalRecordHeader />
                    <View style={styles.gap20} />

                    <PatientSummaryCard
                        profile={profile}
                        totalVisits={totalRecords}
                        lastVisitDate={lastVisit}
                    />

                    {totalRecords > 0 && (
                        <View style={styles.miniCardsRow}>
                            <MiniCard label="Đang điều trị" value={inProgressCount} color="#D97706" bg="#FFFBEB" />
                            <MiniCard label="Hoàn thành" value={completedCount} color="#059669" bg="#ECFDF5" />
                        </View>
                    )}

                    {totalRecords === 0 ? (
                        <EmptyDentalRecord />
                    ) : (
                        <View style={styles.recordList}>
                            <ThemedText style={styles.sectionTitle}>Danh sách hồ sơ nha khoa</ThemedText>
                            {records.map(rec => (
                                <DentalRecordItem key={rec._id} record={rec} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function MiniCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <View style={[miniStyles.card, { backgroundColor: bg }]}>
            <ThemedText style={[miniStyles.value, { color }]}>{value}</ThemedText>
            <ThemedText style={miniStyles.label}>{label}</ThemedText>
        </View>
    );
}

const miniStyles = StyleSheet.create({
    card: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
    value: { fontSize: 28, fontWeight: '800', marginBottom: 4, paddingTop: 4 },
    label: { fontSize: 12, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
});

const itemStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        padding: 18,
        gap: 12,
    },
    headerLeft: { flex: 1 },
    headerRight: { alignItems: 'flex-end', gap: 8 },
    recordName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    doctorText: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
    dateText: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    diagnosisText: { fontSize: 13, color: '#374151', fontStyle: 'italic', lineHeight: 18 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: { fontSize: 12, fontWeight: '700' },
    chevronIcon: {
        width: 14,
        height: 14,
        marginTop: 6,
        tintColor: '#9CA3AF',
    },
    collapsedStats: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    collapsedText: { fontSize: 13, color: '#9CA3AF' },
    expandedContent: {
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    noTreatments: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    inner: { paddingHorizontal: 20 },
    scrollContent: { paddingTop: 20 },
    gap20: { height: 20 },
    miniCardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    recordList: { marginTop: 28 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    skeletonCard: {
        height: 160,
        backgroundColor: '#E5E7EB',
        borderRadius: 24,
        marginBottom: 16,
    },
    skeletonList: {
        height: 300,
        backgroundColor: '#E5E7EB',
        borderRadius: 20,
    },
});
