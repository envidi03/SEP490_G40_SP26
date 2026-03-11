import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

export function ServicesHeader() {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Image
                    source={require('@/assets/images/back.png')}
                    style={styles.backButtonIcon}
                    contentFit="contain"
                />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Danh sách dịch vụ</ThemedText>
            <View style={{ width: 24 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    backButtonIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: '#111827',
    },
});
