import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { Image } from 'expo-image';

export function DentalServices({ services, isLoading }: { services: any[], isLoading: boolean }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Dịch vụ nổi bật</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    // Skeleton loading state
                    [1, 2, 3].map((key) => (
                        <View key={key} style={styles.skeletonCard} />
                    ))
                ) : services?.length > 0 ? (
                    services.map((service, index) => {
                        // Backend might not have real images yet, use fallback gracefully
                        let imageUrl = service.icon;

                        const priceText = service.price
                            ? `${service.price.toLocaleString('vi-VN')} đ`
                            : 'Liên hệ';

                        return (
                            <TouchableOpacity
                                key={service.service_id || service._id || index}
                                style={styles.serviceCard}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.cardImage}
                                    contentFit="cover"
                                    transition={200}
                                />
                                <View style={styles.cardContent}>
                                    <View>
                                        <ThemedText style={styles.serviceName} numberOfLines={2}>
                                            {service.service_name}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.priceTagContainer}>
                                        <ThemedText style={styles.servicePrice}>{priceText}</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <ThemedText style={styles.emptyText}>Chưa có dịch vụ nào.</ThemedText>
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
        paddingRight: 24,
    },
    serviceCard: {
        width: 170,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Subtle premium shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F3F4F6',
    },
    cardContent: {
        padding: 16,
        height: 104,
        justifyContent: 'space-between',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        color: '#111827',
        marginBottom: 8,
    },
    priceTagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5', // Light emerald background
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#059669', // Emerald text
    },
    skeletonCard: {
        width: 170,
        height: 244,
        backgroundColor: '#E5E7EB',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    emptyText: {
        color: '#6B7280',
        paddingVertical: 40,
        fontStyle: 'italic',
    }
});
