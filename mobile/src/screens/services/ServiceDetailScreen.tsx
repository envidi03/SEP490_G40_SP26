import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useServiceDetail, useSubServices, useProfileData } from '@/src/hooks/useHomeData';

type Props = {
    serviceId: string;
};

export function ServiceDetailScreen({ serviceId }: Props) {
    const insets = useSafeAreaInsets();
    const { data: service, isLoading, isError } = useServiceDetail(serviceId);
    const { data: subServices, isLoading: isLoadingSubServices } = useSubServices(serviceId);
    const { data: profileData } = useProfileData();

    const isLoggedIn = !!profileData?.data;

    const handleBookNow = (subServiceId?: string) => {
        if (!isLoggedIn) {
            router.push('/(auth)/login');
        } else {
            router.push({
                pathname: '/booking' as any,
                params: { serviceId, ...(subServiceId ? { subServiceId } : {}) }
            });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isError || !service) {
        return (
            <View style={styles.centerContainer}>
                <ThemedText style={styles.errorText}>Đã có lỗi xảy ra hoặc không tìm thấy dịch vụ.</ThemedText>
                <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
                    <ThemedText style={styles.backButtonInlineText}>Quay lại</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const hasSubServices = (subServices && subServices.length > 0) || service.sub_service_count > 0;
    const availableSubServices: any[] = (subServices || []).filter((s: any) => s.status === 'AVAILABLE');
    const durationText = service.duration ? `${service.duration} phút` : null;

    let priceDisplayText: string;
    if (hasSubServices && service.calculated_min_price) {
        const max = service.calculated_max_price;
        if (max && max !== service.calculated_min_price) {
            priceDisplayText = `Từ ${service.calculated_min_price.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`;
        } else {
            priceDisplayText = `Từ ${service.calculated_min_price.toLocaleString('vi-VN')}đ`;
        }
    } else if (service.price) {
        priceDisplayText = `${service.price.toLocaleString('vi-VN')}đ`;
    } else {
        priceDisplayText = 'Liên hệ';
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + (hasSubServices ? 20 : 100) }}
                bounces={false}
            >
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: service.icon }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={300}
                    />
                    <TouchableOpacity
                        style={[styles.floatingBackButton, { top: Math.max(insets.top, 20) + 10 }]}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconCircle}>
                            <Image
                                source={require('@/assets/images/back.png')}
                                style={styles.backIcon}
                                contentFit="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.contentContainer, { paddingHorizontal: 24 }]}>
                    {/* Title & Status */}
                    <View style={styles.headerRow}>
                        <ThemedText style={styles.serviceName}>{service.service_name}</ThemedText>
                        <View style={[styles.statusBadge, service.status !== 'AVAILABLE' && styles.statusBadgeUnavailable]}>
                            <ThemedText style={[styles.statusText, service.status !== 'AVAILABLE' && styles.statusTextUnavailable]}>
                                {service.status === 'AVAILABLE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Image source={require('@/assets/images/prices.png')} style={styles.tagIcon} contentFit="contain" />
                            <ThemedText style={styles.tagTextPrice}>{priceDisplayText}</ThemedText>
                        </View>
                        {!!durationText && (
                            <View style={styles.tag}>
                                <Image source={require('@/assets/images/clock.png')} style={styles.tagIcon} contentFit="contain" />
                                <ThemedText style={styles.tagText}>{durationText}</ThemedText>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    {!!service.description && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Mô tả dịch vụ</ThemedText>
                            <ThemedText style={styles.descriptionText}>{service.description}</ThemedText>
                        </View>
                    )}

                    {/* Sub-services list */}
                    {hasSubServices && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Các gói dịch vụ</ThemedText>

                            {isLoadingSubServices ? (
                                <ActivityIndicator color="#2563eb" />
                            ) : availableSubServices.length === 0 ? (
                                <ThemedText style={styles.descriptionText}>Chưa có gói dịch vụ. Liên hệ để biết thêm chi tiết.</ThemedText>
                            ) : (
                                availableSubServices.map((sub: any) => {
                                    const subMinPrice = sub.min_price ? `${sub.min_price.toLocaleString('vi-VN')}đ` : null;
                                    const subMaxPrice = sub.max_price ? `${sub.max_price.toLocaleString('vi-VN')}đ` : null;
                                    let subPriceText = 'Liên hệ';
                                    if (subMinPrice && subMaxPrice && sub.min_price !== sub.max_price) {
                                        subPriceText = `${subMinPrice} - ${subMaxPrice}`;
                                    } else if (subMinPrice) {
                                        subPriceText = subMinPrice;
                                    }
                                    const subDuration = sub.duration ? `${sub.duration} phút` : null;

                                    return (
                                        <TouchableOpacity
                                            key={sub._id}
                                            style={styles.subServiceCard}
                                            activeOpacity={0.82}
                                            onPress={() => router.push(`/services/sub-service/${sub._id}` as any)}
                                        >
                                            <View style={styles.subServiceHeader}>
                                                <ThemedText style={styles.subServiceName}>{sub.sub_service_name}</ThemedText>
                                                <View style={styles.subPriceTag}>
                                                    <ThemedText style={styles.subPriceText}>{subPriceText}</ThemedText>
                                                </View>
                                            </View>
                                            {!!sub.description && (
                                                <ThemedText style={styles.subServiceDesc} numberOfLines={2}>{sub.description}</ThemedText>
                                            )}
                                            {!!subDuration && (
                                                <View style={styles.subDuration}>
                                                    <Image source={require('@/assets/images/clock.png')} style={styles.tagIcon} contentFit="contain" />
                                                    <ThemedText style={styles.subServiceMeta}>{subDuration}</ThemedText>
                                                </View>
                                            )}
                                            <View style={styles.subServiceFooter}>
                                                <ThemedText style={styles.viewDetailText}>Xem chi tiết →</ThemedText>
                                                {service.status === 'AVAILABLE' && (
                                                    <TouchableOpacity
                                                        style={styles.bookSubButton}
                                                        activeOpacity={0.85}
                                                        onPress={(e) => {
                                                            e.stopPropagation?.();
                                                            handleBookNow(sub._id);
                                                        }}
                                                    >
                                                        <ThemedText style={styles.bookSubButtonText}>Đặt ngay</ThemedText>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed bottom button for non-category services */}
            {!hasSubServices && (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        style={[styles.primaryButton, service.status !== 'AVAILABLE' && styles.primaryButtonDisabled]}
                        activeOpacity={0.9}
                        disabled={service.status !== 'AVAILABLE'}
                        onPress={() => handleBookNow()}
                    >
                        <ThemedText style={styles.primaryButtonText}>
                            {service.status === 'AVAILABLE' ? 'Đặt lịch ngay' : 'Tạm ngưng nhận lịch'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#3b82f6',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButtonInline: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#dbeafe',
        borderRadius: 100,
    },
    backButtonInlineText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e3a8a',
    },
    imageContainer: {
        width: '100%',
        height: 320,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#dbeafe',
    },
    floatingBackButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: '#2563eb',
    },
    contentContainer: {
        paddingTop: 28,
    },
    headerRow: {
        marginBottom: 14,
    },
    serviceName: {
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 34,
        letterSpacing: -0.5,
        color: '#1e3a8a',
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    statusBadgeUnavailable: {
        backgroundColor: '#FEF2F2',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
    },
    statusTextUnavailable: {
        color: '#DC2626',
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
        flexWrap: 'wrap',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        gap: 8,
    },
    tagIcon: {
        width: 16,
        height: 16,
        tintColor: '#3b82f6',
    },
    tagTextPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    tagText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2563eb',
    },
    divider: {
        height: 1,
        backgroundColor: '#dbeafe',
        marginBottom: 28,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e3a8a',
        marginBottom: 14,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#1d4ed8',
    },
    // Sub Service Card
    subServiceCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    subServiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    subServiceName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '800',
        color: '#1e3a8a',
        lineHeight: 22,
    },
    subPriceTag: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    subPriceText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    subServiceDesc: {
        fontSize: 13,
        color: '#1d4ed8',
        lineHeight: 20,
        marginBottom: 8,
    },
    subServiceMeta: {
        fontSize: 12,
        color: '#3b82f6',
    },
    subDuration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookSubButton: {
        backgroundColor: '#2563eb',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: 'center',
    },
    bookSubButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    subServiceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    viewDetailText: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '600',
    },
    // Bottom bar (for standalone services)
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#dbeafe',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        height: 56,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        backgroundColor: '#bfdbfe',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
