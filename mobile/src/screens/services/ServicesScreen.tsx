import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteServicesData } from '@/src/hooks/useHomeData';

import { ServicesHeader } from '@/src/components/features/services/ServicesHeader';
import { ServicesSearchBar } from '@/src/components/features/services/ServicesSearchBar';
import { ServiceList } from '@/src/components/features/services/ServiceList';

export function ServicesScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const {
        data: rawData,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteServicesData(debouncedQuery);

    const services = useMemo(() => {
        if (!rawData) return [];
        return rawData.pages.flatMap((page: any) =>
            Array.isArray(page) ? page : (page?.data || [])
        );
    }, [rawData]);

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <ServicesHeader />

            <ServicesSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <ServiceList
                data={services}
                isLoading={isLoading}
                isError={isError}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                isFetchingNextPage={isFetchingNextPage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
