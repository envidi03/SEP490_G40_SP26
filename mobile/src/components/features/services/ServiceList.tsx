import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    onEndReached?: () => void;
    isFetchingNextPage?: boolean;
};

export function ServiceList({ data, isLoading, isError, onEndReached, isFetchingNextPage }: Props) {
    const renderServiceCard = ({ item }: { item: any }) => {
        const hasSubServices = item.sub_service_count > 0;
        let priceText: string;

        if (hasSubServices && item.calculated_min_price) {
            priceText = `Từ ${item.calculated_min_price.toLocaleString('vi-VN')}đ`;
        } else if (item.price) {
            priceText = `${item.price.toLocaleString('vi-VN')}đ`;
        } else {
            priceText = 'Liên hệ';
        }

        return (
            <Link href={`/services/${item._id}` as any} asChild>
                <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                    <Image
                        source={{ uri: item.icon }}
                        style={styles.cardImage}
                        contentFit="cover"
                        transition={200}
                    />
                    {hasSubServices && (
                        <View style={styles.subServiceBadge}>
                            <ThemedText style={styles.subServiceBadgeText}>{item.sub_service_count} gói</ThemedText>
                        </View>
                    )}
                    <View style={styles.cardContent}>
                        <ThemedText style={styles.serviceName} numberOfLines={2}>
                            {item.service_name}
                        </ThemedText>
                        <View style={styles.priceTagContainer}>
                            <ThemedText style={styles.servicePrice}>{priceText}</ThemedText>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContent}>
                <ThemedText style={styles.errorText}>Đã có lỗi xảy ra khi tải dữ liệu.</ThemedText>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item, index) => item.service_id || item._id || index.toString()}
            renderItem={renderServiceCard}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color="#2563eb" />
                    </View>
                ) : <View style={{ height: 20 }} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>Không tìm thấy dịch vụ nào phù hợp.</ThemedText>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 16,
    },
    columnWrapper: {
        gap: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#dbeafe',
        maxWidth: '48%', // For evenly spacing 2 columns with gaps

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#dbeafe',
    },
    subServiceBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#2563eb',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    subServiceBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    cardContent: {
        padding: 12,
        height: 100,
        justifyContent: 'space-between',
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
        color: '#1e3a8a',
        marginBottom: 6,
    },
    priceTagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
    servicePrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#3b82f6',
        fontSize: 15,
        fontStyle: 'italic',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    }
});
