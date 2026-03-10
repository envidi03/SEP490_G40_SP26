import { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import { BookingState } from '@/src/screens/booking/BookingScreen';
import { useInfiniteServicesData } from '@/src/hooks/useHomeData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    initialServiceId?: string;
    bookingData: BookingState;
    setBookingData: React.Dispatch<React.SetStateAction<BookingState>>;
};

export function BookingStep1_Services({ initialServiceId, bookingData, setBookingData }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: rawData, isLoading, isError } = useInfiniteServicesData(debouncedQuery);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Flatten services from infinite query pages
    const services = rawData?.pages.flatMap((page) => page.data) || [];

    // Auto-select initial service if coming from detail page
    useEffect(() => {
        if (services.length > 0 && initialServiceId && !hasInitialized) {
            const initialService = services.find(s => (s.service_id || s._id) === initialServiceId);
            if (initialService) {
                setBookingData(prev => ({
                    ...prev,
                    selectedServices: [{
                        _id: initialService._id,
                        service_name: initialService.service_name,
                        price: initialService.price || 0
                    }]
                }));
            }
            setHasInitialized(true);
        }
    }, [services, initialServiceId, hasInitialized, setBookingData]);


    const toggleService = (service: any) => {
        setBookingData(prev => {
            const isSelected = prev.selectedServices.some(s => s._id === service._id);
            if (isSelected) {
                // If it's already selected, deselect it
                return {
                    ...prev,
                    selectedServices: []
                };
            } else {
                // Single selection: replace the array with just this new service
                return {
                    ...prev,
                    selectedServices: [
                        { _id: service._id, service_name: service.service_name, price: service.price || 0 }
                    ]
                };
            }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#111827" />
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

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Bạn muốn sử dụng dịch vụ nào?</ThemedText>
            <ThemedText style={styles.subtitle}>Vui lòng chọn 1 dịch vụ chính</ThemedText>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Image
                    source={require('@/assets/images/search.png')} // Need a generic search icon here
                    style={styles.searchIcon}
                    contentFit="contain"
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm dịch vụ..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>

            <View style={styles.listContainer}>
                {services.filter(s => s.status === 'AVAILABLE').map((service) => {
                    const isSelected = bookingData.selectedServices.some(s => s._id === service._id);
                    const priceText = service.price ? `${service.price.toLocaleString('vi-VN')} đ` : 'Liên hệ';

                    return (
                        <TouchableOpacity
                            key={service._id}
                            style={[
                                styles.serviceCard,
                                isSelected && styles.serviceCardSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => toggleService(service)}
                        >
                            <Image
                                source={{ uri: service.icon }}
                                style={styles.serviceImage}
                                contentFit="cover"
                            />
                            <View style={styles.serviceInfo}>
                                <ThemedText style={[styles.serviceName, isSelected && styles.textSelected]} numberOfLines={2}>
                                    {service.service_name}
                                </ThemedText>
                                <ThemedText style={[styles.servicePrice, isSelected && styles.textSelected]}>
                                    {priceText}
                                </ThemedText>
                            </View>

                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && (
                                    <Image
                                        source={require('@/assets/images/check.png')}
                                        style={styles.checkIcon}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        paddingTop: 50,
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
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
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 24,
        height: 48,
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: '#9CA3AF',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        height: '100%',
    },
    listContainer: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F3F4F6',
    },
    serviceCardSelected: {
        borderColor: '#111827',
        backgroundColor: '#F9FAFB',
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        marginRight: 16,
    },
    serviceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    textSelected: {
        color: '#111827',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    checkboxSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    checkIcon: {
        width: 12,
        height: 12,
        tintColor: '#FFFFFF',
    }
});
