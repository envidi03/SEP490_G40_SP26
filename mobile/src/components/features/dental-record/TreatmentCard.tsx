import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { TreatmentDetailModal } from './TreatmentDetailModal';

type Treatment = {
    _id: string;
    phase: 'PLAN' | 'SESSION';
    tooth_position?: string;
    note?: string;
    result?: string;
    performed_date?: string;
    planned_date?: string;
    status: string;
    medicine_usage?: { medicine_id?: { medicine_name?: string }; quantity?: number; usage_instruction?: string }[];
};

type Props = {
    treatments: Treatment[];
};

const TREATMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    PLANNED: { label: 'Kế hoạch', color: '#6B7280', bg: '#F9FAFB' },
    WAITING_APPROVAL: { label: 'Chờ duyệt', color: '#D97706', bg: '#FFFBEB' },
    APPROVED: { label: 'Đã duyệt', color: '#2563EB', bg: '#EFF6FF' },
    REJECTED: { label: 'Từ chối', color: '#DC2626', bg: '#FEF2F2' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: '#7C3AED', bg: '#F5F3FF' },
    DONE: { label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5' },
    CANCELLED: { label: 'Đã huỷ', color: '#9CA3AF', bg: '#F3F4F6' },
};

const PHASE_LABEL: Record<string, string> = {
    PLAN: 'Kế hoạch',
    SESSION: 'Buổi khám',
};

function TreatmentRow({ item, onPress }: { item: Treatment; onPress: () => void }) {
    const status = TREATMENT_STATUS[item.status] || { label: item.status, color: '#6B7280', bg: '#F9FAFB' };

    let dateDisplay = '';
    try {
        const raw = item.performed_date || item.planned_date;
        if (raw) {
            const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
            dateDisplay = format(d, 'dd/MM/yyyy', { locale: vi });
        }
    } catch (e) { console.log(e); }

    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
                <ThemedText style={styles.title}>
                    {item.tooth_position || item.note || 'Điều trị chung'}
                </ThemedText>

                <ThemedText style={styles.meta}>
                    {PHASE_LABEL[item.phase]} • {dateDisplay}
                </ThemedText>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <ThemedText style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
}

export function TreatmentCard({ treatments }: Props) {
    const [selected, setSelected] = useState<Treatment | null>(null);

    if (!treatments || treatments.length === 0) return null;

    return (
        <View style={styles.container}>
            <ThemedText style={styles.sectionTitle}>Phiếu điều trị</ThemedText>

            <View style={styles.card}>
                {treatments.map(t => (
                    <TreatmentRow
                        key={t._id}
                        item={t}
                        onPress={() => setSelected(t)}
                    />
                ))}
            </View>

            <TreatmentDetailModal
                visible={!!selected}
                treatment={selected}
                onClose={() => setSelected(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 16 },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    rowLast: { borderBottomWidth: 0 },
    phaseTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        minWidth: 72,
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: { fontSize: 11, fontWeight: '600' },
    rowLeft: {
        flex: 1
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827'
    },
    meta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2
    },
});
