import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

function getPriceText(service: any): string {
    if (service.sub_service_count > 0) {
        const min = service.calculated_min_price;
        const max = service.calculated_max_price;
        if (min && max && min !== max) {
            return `Từ ${min.toLocaleString('vi-VN')}đ`;
        }
        if (min) return `Từ ${min.toLocaleString('vi-VN')}đ`;
    }
    if (service.price) return `${service.price.toLocaleString('vi-VN')}đ`;
    return 'Liên hệ';
}

export function DentalServices({ services, isLoading }: { services: any[], isLoading: boolean }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Dịch vụ nổi bật</ThemedText>
                <Link href={"/services" as any} asChild>
                    <TouchableOpacity>
                        <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                    </TouchableOpacity>
                </Link>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    [1, 2, 3].map((key) => (
                        <View key={key} style={styles.skeletonCard} />
                    ))
                ) : services?.length > 0 ? (
                    services.map((service, index) => {
                        const priceText = getPriceText(service);
                        const hasSubServices = service.sub_service_count > 0;

                        return (
                            <Link href={`/services/${service.service_id || service._id}` as any} asChild key={service.service_id || service._id || index}>
                                <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri: service.icon }}
                                        style={styles.cardImage}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                    <View style={styles.cardContent}>
                                        <View>
                                            <ThemedText style={styles.serviceName} numberOfLines={2}>
                                                {service.service_name}
                                            </ThemedText>
                                            {hasSubServices && (
                                                <ThemedText style={styles.subServiceCount}>
                                                    {service.sub_service_count} gói dịch vụ
                                                </ThemedText>
                                            )}
                                        </View>
                                        <View style={styles.priceTagContainer}>
                                            <ThemedText style={styles.servicePrice}>{priceText}</ThemedText>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Link>
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
        color: '#1e3a8a',
    },
    seeAllText: {
        color: '#3b82f6',
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
        borderColor: '#dbeafe',
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
        backgroundColor: '#dbeafe',
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
        color: '#1e3a8a',
        marginBottom: 4,
    },
    subServiceCount: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '500',
        marginBottom: 6,
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
        backgroundColor: '#bfdbfe',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    emptyText: {
        color: '#3b82f6',
        paddingVertical: 40,
        fontStyle: 'italic',
    }
});
