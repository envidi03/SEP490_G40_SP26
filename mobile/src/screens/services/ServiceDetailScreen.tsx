import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useServiceDetail } from '@/src/hooks/useHomeData';

type Props = {
    serviceId: string;
};

export function ServiceDetailScreen({ serviceId }: Props) {
    const insets = useSafeAreaInsets();
    const { data: service, isLoading, isError } = useServiceDetail(serviceId);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#111827" />
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

    const imageUrl = service.icon;
    const priceText = service.price ? `${service.price.toLocaleString('vi-VN')} đ` : 'Liên hệ';
    const durationText = service.duration ? `${service.duration} phút` : 'Chưa cập nhật';

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} // Space for floating button
                bounces={false}
            >
                {/* Hero Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={300}
                    />

                    {/* Floating Back Button */}
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

                {/* Content Section */}
                <View style={[styles.contentContainer, { paddingHorizontal: 24 }]}>
                    <View style={styles.headerRow}>
                        <ThemedText style={styles.serviceName}>{service.service_name}</ThemedText>
                        <View style={[styles.statusBadge, service.status !== 'AVAILABLE' && styles.statusBadgeUnavailable]}>
                            <ThemedText style={[styles.statusText, service.status !== 'AVAILABLE' && styles.statusTextUnavailable]}>
                                {service.status === 'AVAILABLE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Image
                                source={require('@/assets/images/prices.png')} // Optional: Add a small price icon if available or remove
                                style={styles.tagIcon}
                                contentFit="contain"
                            />
                            <ThemedText style={styles.tagTextPrice}>{priceText}</ThemedText>
                        </View>

                        <View style={styles.tag}>
                            <Image
                                source={require('@/assets/images/clock.png')} // Optional: Add a clock icon
                                style={styles.tagIcon}
                                contentFit="contain"
                            />
                            <ThemedText style={styles.tagText}>{durationText}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Mô tả dịch vụ</ThemedText>
                        <ThemedText style={styles.descriptionText}>
                            {service.description || "Chưa có thông tin mô tả chi tiết cho dịch vụ này. Vui lòng liên hệ phòng khám để biết thêm thông tin."}
                        </ThemedText>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity
                    style={[styles.primaryButton, service.status !== 'AVAILABLE' && styles.primaryButtonDisabled]}
                    activeOpacity={0.9}
                    disabled={service.status !== 'AVAILABLE'}
                >
                    <ThemedText style={styles.primaryButtonText}>
                        {service.status === 'AVAILABLE' ? 'Đặt lịch ngay' : 'Tạm ngưng nhận lịch'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
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
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButtonInline: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 100,
    },
    backButtonInlineText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    imageContainer: {
        width: '100%',
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
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
        tintColor: '#111827',
    },
    contentContainer: {
        paddingTop: 32,
    },
    headerRow: {
        marginBottom: 16,
    },
    serviceName: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 36,
        letterSpacing: -0.5,
        color: '#111827',
        marginBottom: 12,
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
        marginBottom: 32,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    tagIcon: {
        width: 16,
        height: 16,
        tintColor: '#6B7280',
    },
    tagTextPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    tagText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#4B5563',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    primaryButton: {
        backgroundColor: '#111827',
        height: 56,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
