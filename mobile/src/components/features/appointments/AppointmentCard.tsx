import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export type Appointment = {
    _id: string;
    full_name: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    book_service?: { service_name?: string; sub_service_name?: string; service_id?: any }[];
    phone?: string;
    doctor_name?: string;
};

const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'CONFIRMED':
        case 'SCHEDULED':
            return { label: 'Đã xác nhận', color: '#059669', bg: '#ECFDF5' };
        case 'PENDING':
            return { label: 'Chờ xác nhận', color: '#D97706', bg: '#FFFBEB' };
        case 'COMPLETED':
            return { label: 'Hoàn thành', color: '#3B82F6', bg: '#EFF6FF' };
        case 'CANCELLED':
            return { label: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2' };
        case 'CHECKED_IN':
            return { label: 'Đã check-in', color: '#7C3AED', bg: '#F5F3FF' };
        case 'IN_CONSULTATION':
            return { label: 'Đang khám', color: '#0284C7', bg: '#E0F2FE' };
        case 'NO_SHOW':
            return { label: 'Không đến', color: '#6B7280', bg: '#F3F4F6' };
        default:
            return { label: status || 'Không rõ', color: '#3b82f6', bg: '#eff6ff' };
    }
};

type Props = {
    appointment: Appointment;
};

export function AppointmentCard({ appointment }: Props) {
    const statusInfo = getStatusInfo(appointment.status);

    let displayDate = appointment.appointment_date;
    try {
        const parsedDate =
            typeof appointment.appointment_date === 'string'
                ? parseISO(appointment.appointment_date)
                : new Date(appointment.appointment_date);
        displayDate = format(parsedDate, 'EEE, dd/MM/yyyy', { locale: vi });
    } catch (_) { }

    const serviceNames = appointment.book_service
        ?.map(s => s.sub_service_name || s.service_name)
        .filter(Boolean)
        .join(', ');

    const doctorName = appointment.doctor_name || 'Chưa phân công';

    return (
        <View style={styles.card}>
            {/* Status Badge + Date */}
            <View style={styles.topRow}>
                <ThemedText style={styles.dateText}>{displayDate}</ThemedText>
                <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                    <ThemedText style={[styles.badgeText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </ThemedText>
                </View>
            </View>

            {/* Time */}
            <View style={styles.timeRow}>
                <View style={styles.iconBox}>
                    <ThemedText style={styles.iconLabel}>🕐</ThemedText>
                </View>
                <ThemedText style={styles.timeText}>{appointment.appointment_time}</ThemedText>
            </View>

            <View style={styles.divider} />

            {/* Doctor */}
            <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Bác sĩ</ThemedText>
                <ThemedText style={styles.infoValue}>{doctorName}</ThemedText>
            </View>

            {/* Services */}
            {serviceNames ? (
                <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Dịch vụ</ThemedText>
                    <ThemedText style={[styles.infoValue, styles.serviceValue]} numberOfLines={2}>
                        {serviceNames}
                    </ThemedText>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#dbeafe',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e3a8a',
        textTransform: 'capitalize',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLabel: {
        fontSize: 14,
    },
    timeText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e3a8a',
        letterSpacing: -0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#dbeafe',
        marginBottom: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        gap: 6,
    },
    infoLabel: {
        fontSize: 13,
        color: '#60a5fa',
        fontWeight: '600',
        minWidth: 60,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1d4ed8',
        flex: 1,
    },
    serviceValue: {
        color: '#1d4ed8',
    },
});
