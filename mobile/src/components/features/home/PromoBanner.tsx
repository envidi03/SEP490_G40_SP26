import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ui/themed-text';

export function PromoBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
    const handleBookNow = () => {
        if (!isLoggedIn) {
            router.push('/(auth)/login');
        } else {
            router.push('/booking' as any);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80' }}
                style={styles.imageBackground}
                contentFit="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.content}>
                <View>
                    <ThemedText style={styles.tag}>ƯU ĐÃI ĐẶC BIỆT</ThemedText>
                    <ThemedText style={styles.title}>Kiểm tra răng{'\n'}định kỳ</ThemedText>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleBookNow}>
                    <ThemedText style={styles.buttonText}>Đặt lịch ngay</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#E5E7EB',
    },
    imageBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    tag: {
        color: '#E0F2FE',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 100,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 14,
    },
});
