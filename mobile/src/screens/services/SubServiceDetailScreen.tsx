import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useSubServiceDetail, useSubServices, useServiceDetail, useProfileData } from '@/src/hooks/useHomeData';

type Props = {
    subServiceId: string;
};

export function SubServiceDetailScreen({ subServiceId }: Props) {
    const insets = useSafeAreaInsets();
    const { data: subService, isLoading, isError } = useSubServiceDetail(subServiceId);
    const { data: profileData } = useProfileData();

    // Fetch the parent service for context (once we have parent_id from subService)
    const parentId = subService?.parent_id?._id || subService?.parent_id || '';
    const { data: parentService } = useServiceDetail(parentId);
    const { data: allSubServices, isLoading: isLoadingRelated } = useSubServices(parentId);

    const isLoggedIn = !!profileData?.data;

    const handleBookNow = () => {
        if (!isLoggedIn) {
            router.push('/(auth)/login');
        } else {
            router.push({
                pathname: '/booking' as any,
                params: { serviceId: parentId, subServiceId }
            });
        }
    };

    const handleViewSubService = (relatedSubId: string) => {
        router.push(`/services/sub-service/${relatedSubId}` as any);
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isError || !subService) {
        return (
            <View style={styles.centerContainer}>
                <ThemedText style={styles.errorText}>Không tìm thấy gói dịch vụ.</ThemedText>
                <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
                    <ThemedText style={styles.backButtonInlineText}>Quay lại</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const minPrice = subService.min_price ? `${subService.min_price.toLocaleString('vi-VN')}đ` : null;
    const maxPrice = subService.max_price ? `${subService.max_price.toLocaleString('vi-VN')}đ` : null;
    let priceDisplayText = 'Liên hệ';
    if (minPrice && maxPrice && subService.min_price !== subService.max_price) {
        priceDisplayText = `${minPrice} - ${maxPrice}`;
    } else if (minPrice) {
        priceDisplayText = minPrice;
    }

    const durationText = subService.duration ? `${subService.duration} phút` : null;
    const isAvailable = subService.status === 'AVAILABLE';

    // Related sub-services = all sibling sub-services minus current one
    const relatedSubServices = (allSubServices || []).filter(
        (s: any) => s._id !== subServiceId && s.status === 'AVAILABLE'
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                bounces={false}
            >
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: subService.icon || parentService?.icon }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={300}
                    />
                    {/* Dark gradient overlay for readability */}
                    <View style={styles.imageOverlay} />

                    {/* Back button */}
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

                    {/* Category breadcrumb on the hero image */}
                    {!!parentService?.service_name && (
                        <TouchableOpacity
                            style={[styles.breadcrumb, { top: Math.max(insets.top, 20) + 10 }]}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.breadcrumbText}>
                                {parentService.service_name}
                            </ThemedText>
                            <ThemedText style={styles.breadcrumbSeparator}> / </ThemedText>
                            <ThemedText style={styles.breadcrumbCurrentText} numberOfLines={1}>
                                {subService.sub_service_name}
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <View style={[styles.contentContainer, { paddingHorizontal: 24 }]}>
                    {/* Title row */}
                    <View style={styles.headerRow}>
                        <ThemedText style={styles.serviceName}>{subService.sub_service_name}</ThemedText>
                        <View style={[styles.statusBadge, !isAvailable && styles.statusBadgeUnavailable]}>
                            <ThemedText style={[styles.statusText, !isAvailable && styles.statusTextUnavailable]}>
                                {isAvailable ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Tags: price, duration */}
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
                    {!!subService.description && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Mô tả gói dịch vụ</ThemedText>
                            <ThemedText style={styles.descriptionText}>{subService.description}</ThemedText>
                        </View>
                    )}

                    {/* Note */}
                    {!!subService.note && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Lưu ý</ThemedText>
                            <View style={styles.noteBox}>
                                <ThemedText style={styles.noteText}>{subService.note}</ThemedText>
                            </View>
                        </View>
                    )}

                    {/* Related sub-services (siblings from same category) */}
                    {(relatedSubServices.length > 0 || isLoadingRelated) && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>
                                Các gói khác trong cùng danh mục
                            </ThemedText>

                            {isLoadingRelated ? (
                                <ActivityIndicator color="#2563eb" />
                            ) : (
                                relatedSubServices.map((related: any) => {
                                    const rMin = related.min_price ? `${related.min_price.toLocaleString('vi-VN')}đ` : null;
                                    const rMax = related.max_price ? `${related.max_price.toLocaleString('vi-VN')}đ` : null;
                                    let rPriceText = 'Liên hệ';
                                    if (rMin && rMax && related.min_price !== related.max_price) {
                                        rPriceText = `${rMin} - ${rMax}`;
                                    } else if (rMin) {
                                        rPriceText = rMin;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={related._id}
                                            style={styles.relatedCard}
                                            activeOpacity={0.8}
                                            onPress={() => handleViewSubService(related._id)}
                                        >
                                            <Image
                                                source={{ uri: related.icon || parentService?.icon }}
                                                style={styles.relatedImage}
                                                contentFit="cover"
                                            />
                                            <View style={styles.relatedInfo}>
                                                <ThemedText style={styles.relatedName} numberOfLines={2}>
                                                    {related.sub_service_name}
                                                </ThemedText>
                                                <ThemedText style={styles.relatedPrice}>{rPriceText}</ThemedText>
                                                <View style={styles.relatedDuration}>
                                                    <Image source={require('@/assets/images/clock.png')} style={styles.tagIcon} contentFit="contain" />
                                                    {!!related.duration && (
                                                        <ThemedText style={styles.relatedMeta}>{related.duration} phút</ThemedText>
                                                    )}
                                                </View>
                                            </View>
                                            <Image
                                                source={require('@/assets/images/back.png')}
                                                style={styles.chevronRight}
                                                contentFit="contain"
                                            />
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed bottom booking button */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity
                    style={[styles.primaryButton, !isAvailable && styles.primaryButtonDisabled]}
                    activeOpacity={0.9}
                    disabled={!isAvailable}
                    onPress={handleBookNow}
                >
                    <ThemedText style={styles.primaryButtonText}>
                        {isAvailable ? 'Đặt gói này ngay' : 'Tạm ngưng nhận lịch'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centerContainer: {
        flex: 1, backgroundColor: '#FFFFFF',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    errorText: { fontSize: 16, color: '#3b82f6', textAlign: 'center', marginBottom: 20 },
    backButtonInline: {
        paddingVertical: 12, paddingHorizontal: 24,
        backgroundColor: '#dbeafe', borderRadius: 100,
    },
    backButtonInlineText: { fontSize: 15, fontWeight: '600', color: '#1e3a8a' },
    // Hero
    imageContainer: { width: '100%', height: 300, position: 'relative' },
    heroImage: { width: '100%', height: '100%', backgroundColor: '#dbeafe' },
    imageOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        // Simple gradient via a translucent white layer
        backgroundColor: 'rgba(255,255,255,0.0)',
    },
    floatingBackButton: { position: 'absolute', left: 20, zIndex: 10 },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    },
    backIcon: { width: 20, height: 20, tintColor: '#2563eb' },
    breadcrumb: {
        position: 'absolute', right: 16, zIndex: 10,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.88)',
        borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
        maxWidth: 230,
    },
    breadcrumbText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
    breadcrumbSeparator: { fontSize: 12, color: '#93c5fd' },
    breadcrumbCurrentText: { fontSize: 12, color: '#1e3a8a', fontWeight: '700', flexShrink: 1 },
    // Content
    contentContainer: { paddingTop: 28 },
    headerRow: { marginBottom: 14 },
    serviceName: {
        fontSize: 26, fontWeight: '800', lineHeight: 34,
        letterSpacing: -0.5, color: '#1e3a8a', marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start', backgroundColor: '#ECFDF5',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    },
    statusBadgeUnavailable: { backgroundColor: '#FEF2F2' },
    statusText: { fontSize: 13, fontWeight: '700', color: '#059669' },
    statusTextUnavailable: { color: '#DC2626' },
    tagsContainer: { flexDirection: 'row', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
    tag: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe', gap: 8,
    },
    tagIcon: { width: 16, height: 16, tintColor: '#3b82f6' },
    tagTextPrice: { fontSize: 15, fontWeight: '700', color: '#1e3a8a' },
    tagText: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
    divider: { height: 1, backgroundColor: '#dbeafe', marginBottom: 28 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e3a8a', marginBottom: 14 },
    descriptionText: { fontSize: 15, lineHeight: 24, color: '#1d4ed8' },
    noteBox: {
        backgroundColor: '#fefce8', borderRadius: 12,
        padding: 16, borderWidth: 1, borderColor: '#fde68a',
    },
    noteText: { fontSize: 14, lineHeight: 22, color: '#92400e' },
    // Related cards
    relatedCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#eff6ff', borderRadius: 16,
        padding: 12, marginBottom: 10,
        borderWidth: 1, borderColor: '#bfdbfe', gap: 12,
    },
    relatedImage: {
        width: 64, height: 64, borderRadius: 12, backgroundColor: '#bfdbfe',
    },
    relatedInfo: { flex: 1 },
    relatedName: { fontSize: 14, fontWeight: '700', color: '#1e3a8a', marginBottom: 4 },
    relatedPrice: { fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 2 },
    relatedMeta: { fontSize: 12, color: '#3b82f6' },
    chevronRight: { width: 18, height: 18, tintColor: '#93c5fd' },
    // Bottom bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: '#dbeafe',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 10,
    },
    primaryButton: {
        backgroundColor: '#2563eb', height: 56,
        borderRadius: 100, justifyContent: 'center', alignItems: 'center',
    },
    primaryButtonDisabled: { backgroundColor: '#bfdbfe' },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    relatedDuration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
