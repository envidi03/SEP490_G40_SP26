import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ui/themed-text';

export function EmptyDentalRecord() {
    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Chưa có hồ sơ nha khoa</ThemedText>
            <ThemedText style={styles.subtitle}>
                Lịch sử khám của bạn sẽ xuất hiện ở đây sau mỗi lần điều trị.
            </ThemedText>
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={() => router.push('/booking' as any)}
            >
                <ThemedText style={styles.buttonText}>Đặt lịch khám ngay</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 48,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e3a8a',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#60a5fa',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 100,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
