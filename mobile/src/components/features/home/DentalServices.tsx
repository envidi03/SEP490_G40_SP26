import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

const FALLBACK_COLORS = ['#F3F4F6', '#FDF2F8', '#EFF6FF', '#FEF2F2'];

export function DentalServices({ services, isLoading }: { services: any[], isLoading: boolean }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Dịch vụ nha khoa</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    // Skeleton loading state
                    [1, 2, 3].map((key) => (
                        <View key={key} style={[styles.serviceCard, styles.skeletonCard]} />
                    ))
                ) : services?.length > 0 ? (
                    services.map((service, index) => (
                        <TouchableOpacity
                            key={service.service_id || index}
                            style={[styles.serviceCard, { backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }]}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dot} />
                            <ThemedText style={styles.serviceName}>{service.service_name}</ThemedText>
                        </TouchableOpacity>
                    ))
                ) : (
                    <ThemedText style={{ color: '#6B7280', padding: 20 }}>Chưa có dịch vụ nào.</ThemedText>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: '#111827',
    },
    seeAllText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },
    scrollContent: {
        gap: 16,
    },
    serviceCard: {
        width: 140,
        height: 140,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#111827',
        opacity: 0.2,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
        color: '#111827',
    },
    skeletonCard: {
        backgroundColor: '#E5E7EB',
    }
});
