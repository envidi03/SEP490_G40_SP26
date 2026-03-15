import { Modal, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Image } from 'expo-image';

type MedicineUsage = {
    medicine_id?: {
        medicine_name?: string;
    };
    quantity?: number;
    usage_instruction?: string;
};

type Treatment = {
    _id: string;
    phase: string;
    tooth_position?: string;
    planned_date?: string;
    performed_date?: string;
    result?: string;
    note?: string;
    medicine_usage?: MedicineUsage[];
    status: string;
};

type Props = {
    visible: boolean;
    treatment: Treatment | null;
    onClose: () => void;
};

const PHASE_LABEL: Record<string, string> = {
    PLAN: 'Kế hoạch',
    SESSION: 'Buổi khám',
};


export function TreatmentDetailModal({ visible, treatment, onClose }: Props) {
    if (!treatment) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
            return format(d, 'dd/MM/yyyy', { locale: vi });
        } catch {
            return '';
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>
                            Chi tiết phiếu điều trị
                        </ThemedText>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* Basic Info */}
                        <View style={styles.infoBlock}>
                            <InfoRow label="Vị trí răng" value={treatment.tooth_position || 'Không xác định'} />
                            <InfoRow label="Giai đoạn" value={PHASE_LABEL[treatment.phase] || treatment.phase} />

                            {treatment.planned_date && (
                                <InfoRow label="Ngày dự kiến" value={formatDate(treatment.planned_date)} />
                            )}

                            {treatment.performed_date && (
                                <InfoRow label="Ngày thực hiện" value={formatDate(treatment.performed_date)} />
                            )}
                        </View>

                        {/* Result */}
                        {!!treatment.result && (
                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>Kết quả điều trị</ThemedText>
                                <ThemedText style={styles.sectionText}>
                                    {treatment.result}
                                </ThemedText>
                            </View>
                        )}

                        {/* Note */}
                        {!!treatment.note && (
                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
                                <ThemedText style={styles.sectionText}>
                                    {treatment.note}
                                </ThemedText>
                            </View>
                        )}

                        {/* Medicine */}
                        {treatment.medicine_usage && treatment.medicine_usage.length > 0 && (
                            <View style={styles.medicineSection}>
                                <View style={styles.medicineHeader}>
                                    <Image
                                        source={require('@/assets/images/pill.png')}
                                        style={styles.medicineIcon}
                                        contentFit="contain"
                                    />

                                    <ThemedText style={styles.medicineTitle}>
                                        Thuốc được kê
                                    </ThemedText>
                                </View>

                                {treatment.medicine_usage.map((m, i) => (
                                    <View key={i} style={styles.medicineItem}>
                                        <ThemedText style={styles.medicineName}>
                                            {m.medicine_id?.medicine_name || 'Thuốc'}
                                        </ThemedText>

                                        <ThemedText style={styles.medicineDetail}>
                                            Số lượng: {m.quantity}
                                        </ThemedText>

                                        {!!m.usage_instruction && (
                                            <ThemedText style={styles.medicineInstruction}>
                                                {m.usage_instruction}
                                            </ThemedText>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <ThemedText style={styles.closeText}>Đóng</ThemedText>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{label}</ThemedText>
            <ThemedText style={styles.infoValue}>{value}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end'
    },

    modal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },

    header: {
        alignItems: 'center',
        marginBottom: 16,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    infoBlock: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    infoLabel: {
        fontSize: 13,
        color: '#6B7280',
    },

    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },

    section: {
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
    },

    sectionText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
    },

    medicineSection: {
        backgroundColor: '#FFFBEB',
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
    },

    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    medicineIcon: {
        width: 18,
        height: 18,
        marginRight: 6,
    },

    medicineTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 10,
    },

    medicineItem: {
        marginBottom: 8,
    },

    medicineName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#78350F',
    },

    medicineDetail: {
        fontSize: 12,
        color: '#92400E',
    },

    medicineInstruction: {
        fontSize: 12,
        color: '#92400E',
        fontStyle: 'italic',
    },

    closeBtn: {
        backgroundColor: '#1E3A5F',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 6,
    },

    closeText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});
