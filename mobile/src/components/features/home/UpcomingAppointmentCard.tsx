import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

type Appointment = {
    _id: string;
    full_name: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    book_service?: { service_name?: string; service_id?: any }[];
    phone?: string;
    doctor_name?: string;
    doctor_avatar?: string;
};

type Props = {
    appointments: Appointment[];
    isLoading: boolean;
};

// Map status code to Vietnamese label and color
const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'CONFIRMED':
            return { label: 'Đã xác nhận', color: '#059669', bg: '#ECFDF5' };
        case 'PENDING':
            return { label: 'Chờ xác nhận', color: '#D97706', bg: '#FFFBEB' };
        case 'COMPLETED':
            return { label: 'Hoàn thành', color: '#3B82F6', bg: '#EFF6FF' };
        case 'CANCELLED':
            return { label: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2' };
        default:
            return { label: status || 'Không rõ', color: '#6B7280', bg: '#F9FAFB' };
    }
};

export function UpcomingAppointmentCard({ appointments, isLoading }: Props) {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText style={styles.sectionTitle}>Lịch hẹn sắp tới</ThemedText>
                </View>
                {/* Skeleton loader */}
                <View style={[styles.card, styles.skeletonCard]} />
            </View>
        );
    }

    if (!appointments || appointments.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText style={styles.sectionTitle}>Lịch hẹn sắp tới</ThemedText>
                </View>
                <View style={styles.emptyCard}>
                    <ThemedText style={styles.emptyTitle}>Chưa có lịch hẹn</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>Đặt lịch ngay để chăm sóc sức khỏe của bạn</ThemedText>
                </View>
            </View>
        );
    }

    // Take the first (nearest) appointment
    const appointment = appointments[0];
    const statusInfo = getStatusInfo(appointment.status);

    // Format date
    let displayDate = appointment.appointment_date;
    try {
        const parsedDate = typeof appointment.appointment_date === 'string'
            ? parseISO(appointment.appointment_date)
            : new Date(appointment.appointment_date);
        displayDate = format(parsedDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch (e) {
        console.log(e);
    }

    // Get services list
    const serviceNames = appointment.book_service
        ?.map(s => s.service_name)
        .filter(Boolean);

    const doctorName = appointment.doctor_name || 'Chờ phân công';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Lịch hẹn sắp tới</ThemedText>
            </View>

            <TouchableOpacity style={styles.card} activeOpacity={0.85}>

                {/* Top Row: Patient name + Status Badge */}
                <View style={styles.topRow}>
                    <View style={styles.nameBlock}>
                        <ThemedText style={styles.nameLabel}>Bác sĩ</ThemedText>
                        <ThemedText style={styles.nameValue} numberOfLines={1}>
                            {doctorName}
                        </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </ThemedText>
                    </View>
                </View>

                {/* Service */}
                <View style={styles.serviceRow}>
                    <ThemedText style={styles.serviceLabel}>Dịch vụ:</ThemedText>
                    <ThemedText style={styles.serviceValue} numberOfLines={2}>{serviceNames}</ThemedText>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Date & Time */}
                <View style={styles.timeSection}>
                    <View style={styles.timeBlock}>
                        <ThemedText style={styles.timeLabel}>NGÀY KHÁM</ThemedText>
                        <ThemedText style={[styles.timeValue, styles.dateValue]}>
                            {displayDate}
                        </ThemedText>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                        <ThemedText style={styles.timeLabel}>GIỜ KHÁM</ThemedText>
                        <ThemedText style={styles.timeValue}>{appointment.appointment_time}</ThemedText>
                    </View>
                </View>

            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: '#111827',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    skeletonCard: {
        height: 190,
        backgroundColor: '#F9FAFB',
    },
    emptyCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    nameBlock: {
        flex: 1,
        marginRight: 12,
    },
    nameLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    nameValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    serviceLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 6,
        paddingTop: 1,
    },
    serviceValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    pendingText: {
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 20,
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBlock: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 6,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    dateValue: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
    verticalDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
});
