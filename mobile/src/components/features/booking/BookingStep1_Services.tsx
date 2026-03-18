import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import { BookingState } from '@/src/screens/booking/BookingScreen';
import { useInfiniteServicesData, useSubServices } from '@/src/hooks/useHomeData';

type Props = {
    initialServiceId?: string;
    initialSubServiceId?: string;
    bookingData: BookingState;
    setBookingData: React.Dispatch<React.SetStateAction<BookingState>>;
};

/** Single service row with optional expandable sub-services */
function ServiceRow({
    service,
    bookingData,
    setBookingData,
    initialSubServiceId,
}: {
    service: any;
    bookingData: BookingState;
    setBookingData: React.Dispatch<React.SetStateAction<BookingState>>;
    initialSubServiceId?: string;
}) {
    const hasSubServices = service.sub_service_count > 0;
    const [expanded, setExpanded] = useState(false);

    // Fetch sub-services only when expanded
    const { data: subServices, isLoading: loadingSubs } = useSubServices(expanded || !!initialSubServiceId ? service._id : '');
    const availableSubs: any[] = useMemo(
        () => (subServices || []).filter((s: any) => s.status === 'AVAILABLE'),
        [subServices]
    );

    // Auto-expand if this category was pre-selected via initialSubServiceId
    useEffect(() => {
        if (initialSubServiceId && service._id) {
            setExpanded(true);
        }
    }, [initialSubServiceId, service._id]);

    const isServiceSelected = bookingData.selectedServices.some(s => s._id === service._id && !s.sub_service_id);
    const isSubSelected = (subId: string) => bookingData.selectedServices.some(s => s.sub_service_id === subId);

    const getPriceText = (): string => {
        if (hasSubServices && service.calculated_min_price) {
            return `Từ ${service.calculated_min_price.toLocaleString('vi-VN')}đ`;
        }
        if (service.price) return `${service.price.toLocaleString('vi-VN')}đ`;
        return 'Liên hệ';
    };

    const selectService = () => {
        setBookingData(prev => ({
            ...prev,
            selectedServices: [{
                _id: service._id,
                service_name: service.service_name,
                price: service.price || service.calculated_min_price || 0,
            }]
        }));
    };

    const selectSubService = (sub: any) => {
        setBookingData(prev => ({
            ...prev,
            selectedServices: [{
                _id: service._id,
                service_name: service.service_name,
                price: sub.min_price || 0,
                sub_service_id: sub._id,
                sub_service_name: sub.sub_service_name,
            }]
        }));
    };

    return (
        <View style={styles.serviceCard}>
            {/* Main service row */}
            <TouchableOpacity
                style={styles.serviceRow}
                activeOpacity={0.7}
                onPress={() => {
                    if (hasSubServices) {
                        setExpanded(e => !e);
                    } else {
                        selectService();
                    }
                }}
            >
                <Image source={{ uri: service.icon }} style={styles.serviceImage} contentFit="cover" />
                <View style={styles.serviceInfo}>
                    <ThemedText style={styles.serviceName} numberOfLines={2}>{service.service_name}</ThemedText>
                    <ThemedText style={styles.servicePrice}>{getPriceText()}</ThemedText>
                    {hasSubServices && (
                        <ThemedText style={styles.subCountText}>{service.sub_service_count} gói dịch vụ</ThemedText>
                    )}
                </View>
                {hasSubServices ? (
                    <Image
                        source={expanded ? require('@/assets/images/up.png') : require('@/assets/images/down.png')}
                        style={styles.chevron}
                        contentFit="contain"
                    />
                ) : (
                    <View style={[styles.checkbox, isServiceSelected && styles.checkboxSelected]}>
                        {isServiceSelected && (
                            <Image source={require('@/assets/images/check.png')} style={styles.checkIcon} contentFit="contain" />
                        )}
                    </View>
                )}
            </TouchableOpacity>

            {/* Sub-services accordion */}
            {hasSubServices && expanded && (
                <View style={styles.subList}>
                    {loadingSubs ? (
                        <ActivityIndicator color="#2563eb" style={{ paddingVertical: 16 }} />
                    ) : availableSubs.length === 0 ? (
                        <ThemedText style={styles.noSubText}>Chưa có gói dịch vụ khả dụng.</ThemedText>
                    ) : (
                        availableSubs.map((sub: any) => {
                            const selected = isSubSelected(sub._id);
                            const subPrice = sub.min_price
                                ? `${sub.min_price.toLocaleString('vi-VN')}đ${sub.max_price && sub.max_price !== sub.min_price ? ` - ${sub.max_price.toLocaleString('vi-VN')}đ` : ''}`
                                : 'Liên hệ';
                            return (
                                <TouchableOpacity
                                    key={sub._id}
                                    style={[styles.subServiceRow, selected && styles.subServiceRowSelected]}
                                    activeOpacity={0.7}
                                    onPress={() => selectSubService(sub)}
                                >
                                    <View style={styles.subServiceInfo}>
                                        <ThemedText style={[styles.subServiceName, selected && styles.subServiceNameSelected]}>
                                            {sub.sub_service_name}
                                        </ThemedText>
                                        <ThemedText style={styles.subServicePrice}>{subPrice}</ThemedText>
                                        {!!sub.duration && (
                                            <View style={styles.subDuration}>
                                                <Image source={require('@/assets/images/clock.png')} style={styles.tagIcon} contentFit="contain" />
                                                <ThemedText style={styles.subDuration}>{sub.duration} phút</ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                        {selected && (
                                            <Image source={require('@/assets/images/check.png')} style={styles.checkIcon} contentFit="contain" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            )}
        </View>
    );
}

export function BookingStep1_Services({ initialServiceId, initialSubServiceId, bookingData, setBookingData }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: rawData, isLoading, isError } = useInfiniteServicesData(debouncedQuery);
    const [hasInitialized, setHasInitialized] = useState(false);

    const services = useMemo(
        () => rawData?.pages.flatMap((page) => (page as any)?.data || []) || [],
        [rawData]
    );

    // Auto-select from navigation params
    useEffect(() => {
        if (services.length > 0 && initialServiceId && !hasInitialized) {
            const initialService = services.find((s: any) => (s.service_id || s._id) === initialServiceId);
            if (initialService) {
                setBookingData(prev => ({
                    ...prev,
                    selectedServices: [{
                        _id: initialService._id,
                        service_name: initialService.service_name,
                        price: initialService.price || initialService.calculated_min_price || 0,
                        ...(initialSubServiceId ? { sub_service_id: initialSubServiceId } : {}),
                    }]
                }));
            }
            setHasInitialized(true);
        }
    }, [services, initialServiceId, initialSubServiceId, hasInitialized, setBookingData]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <ThemedText style={styles.errorText}>Lỗi khi tải danh sách dịch vụ.</ThemedText>
            </View>
        );
    }

    const availableServices = services.filter((s: any) => s.status === 'AVAILABLE');

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Bạn muốn sử dụng dịch vụ nào?</ThemedText>
            <ThemedText style={styles.subtitle}>Chọn danh mục, sau đó chọn 1 gói cụ thể</ThemedText>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Image source={require('@/assets/images/search.png')} style={styles.searchIcon} contentFit="contain" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm dịch vụ..."
                    placeholderTextColor="#60a5fa"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>

            <View style={styles.listContainer}>
                {availableServices.map((service: any) => (
                    <ServiceRow
                        key={service._id}
                        service={service}
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                        initialSubServiceId={service._id === initialServiceId ? initialSubServiceId : undefined}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { paddingTop: 50, alignItems: 'center' },
    errorText: { color: '#EF4444' },
    title: { fontSize: 22, fontWeight: '800', color: '#1e3a8a', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#3b82f6', marginBottom: 16 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
        height: 46,
    },
    searchIcon: { width: 18, height: 18, tintColor: '#60a5fa', marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#1e3a8a', height: '100%' },
    listContainer: { gap: 12 },
    // Main service card
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#dbeafe',
        overflow: 'hidden',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#bfdbfe',
    },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 15, fontWeight: '700', color: '#1e3a8a', marginBottom: 2 },
    servicePrice: { fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 2 },
    subCountText: { fontSize: 12, color: '#3b82f6' },
    chevron: { width: 18, height: 18, tintColor: '#3b82f6' },
    // Sub-services list
    subList: {
        borderTopWidth: 1,
        borderTopColor: '#dbeafe',
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    noSubText: { fontSize: 13, color: '#60a5fa', padding: 8, textAlign: 'center' },
    subServiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#bfdbfe',
        gap: 8,
    },
    subServiceRowSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff',
    },
    subServiceInfo: { flex: 1 },
    subServiceName: { fontSize: 14, fontWeight: '700', color: '#1d4ed8', marginBottom: 2 },
    subServiceNameSelected: { color: '#1e3a8a' },
    subServicePrice: { fontSize: 13, fontWeight: '600', color: '#059669' },
    subDuration: {
        fontSize: 12,
        color: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tagIcon: {
        width: 12,
        height: 12,
        tintColor: '#3b82f6',
    },
    // Checkbox
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#93c5fd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#1e3a8a',
    },
    checkIcon: { width: 11, height: 11, tintColor: '#FFFFFF' },
});
