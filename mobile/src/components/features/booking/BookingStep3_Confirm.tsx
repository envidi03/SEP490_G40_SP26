import { StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { BookingState } from '@/src/screens/booking/BookingScreen';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCreateAppointment } from '@/src/hooks/useHomeData';
import { router } from 'expo-router';

type Props = {
    bookingData: BookingState;
    profile: any;
};

export function BookingStep3_Confirm({ bookingData, profile }: Props) {
    const createAppointmentMutation = useCreateAppointment();

    const totalPrice = bookingData.selectedServices.reduce((sum, service) => sum + service.price, 0);

    // Format date beautifully
    let displayDate = bookingData.selectedDate;
    try {
        if (bookingData.selectedDate) {
            displayDate = format(new Date(bookingData.selectedDate), 'EEEE, dd MMMM yyyy', { locale: vi });
        }
    } catch (e) {
        console.log(e);
    }

    const handleConfirm = async () => {
        try {
            // Mapping the payload to match what the backend expects
            const payload = {
                full_name: profile.full_name || 'Khách hàng',
                phone: profile?.account_id?.phone_number || '',
                email: profile?.account_id?.email || '',
                appointment_date: bookingData.selectedDate,
                appointment_time: bookingData.selectedTime,
                book_service: bookingData.selectedServices.map(s => ({
                    service_id: s._id,
                    unit_price: s.price
                }))
            };

            await createAppointmentMutation.mutateAsync(payload);

            Alert.alert(
                "Thành công",
                "Đã đặt lịch hẹn. Vui lòng kiểm tra email để xem chi tiết.",
                [
                    { text: "OK", onPress: () => router.replace('/(tabs)' as any) }
                ]
            );

        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại sau.");
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Xác nhận thông tin</ThemedText>
            <ThemedText style={styles.subtitle}>Vui lòng kiểm tra lại trước khi đặt lịch</ThemedText>

            {/* Profile Summary */}
            <View style={styles.card}>
                <ThemedText style={styles.cardTitle}>Thông tin liên hệ</ThemedText>

                <View style={styles.row}>
                    <ThemedText style={styles.label}>Họ và tên:</ThemedText>
                    <ThemedText style={styles.value}>{profile?.full_name || 'Chưa cập nhật'}</ThemedText>
                </View>

                <View style={styles.row}>
                    <ThemedText style={styles.label}>Số điện thoại:</ThemedText>
                    <ThemedText style={styles.value}>{profile?.account_id?.phone_number || 'Chưa cập nhật'}</ThemedText>
                </View>
            </View>

            {/* DateTime Summary */}
            <View style={styles.card}>
                <ThemedText style={styles.cardTitle}>Thời gian khám</ThemedText>

                <View style={styles.row}>
                    <ThemedText style={styles.label}>Ngày:</ThemedText>
                    <ThemedText style={[styles.value, { textTransform: 'capitalize' }]}>{displayDate}</ThemedText>
                </View>

                <View style={styles.row}>
                    <ThemedText style={styles.label}>Giờ:</ThemedText>
                    <ThemedText style={styles.valueHighlight}>{bookingData.selectedTime}</ThemedText>
                </View>
            </View>

            {/* Services Summary */}
            <View style={styles.card}>
                <ThemedText style={styles.cardTitle}>Dịch vụ đã chọn</ThemedText>

                {bookingData.selectedServices.map((service, index) => (
                    <View key={service._id} style={[styles.row, index > 0 && styles.rowBorderTop]}>
                        <ThemedText style={[styles.label, { flex: 1 }]} numberOfLines={2}>
                            {service.service_name}
                        </ThemedText>
                        <ThemedText style={styles.value}>
                            {service.price > 0 ? `${service.price.toLocaleString('vi-VN')} đ` : `Liên hệ`}
                        </ThemedText>
                    </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.row}>
                    <ThemedText style={styles.totalLabel}>Ước tính tổng cộng:</ThemedText>
                    <ThemedText style={styles.totalValue}>
                        {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')} đ` : 'Tùy tình trạng'}
                    </ThemedText>
                </View>
            </View>

            {/* Confirm Action */}
            <View style={styles.actionContainer}>
                <ThemedText style={styles.noticeText}>
                    Bằng việc xác nhận, bạn đồng ý với các điều khoản của phòng khám.
                </ThemedText>

                <View style={styles.confirmButton} onTouchEnd={handleConfirm}>
                    <ThemedText style={styles.confirmButtonText}>
                        {createAppointmentMutation.isPending ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                    </ThemedText>
                </View>
            </View>

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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rowBorderTop: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    valueHighlight: {
        fontSize: 15,
        fontWeight: '700',
        color: '#059669',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
        borderStyle: 'dashed',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#EF4444',
    },
    actionContainer: {
        marginTop: 16,
        marginBottom: 40,
    },
    noticeText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    confirmButton: {
        backgroundColor: '#111827',
        height: 56,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
