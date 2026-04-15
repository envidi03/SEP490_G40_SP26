import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    errorMsg?: string;
    title?: string;
    subtitle?: string;
    showBackButton?: boolean;
};

export function AuthHeader({ errorMsg, title = 'Đăng nhập', subtitle = 'Vui lòng nhập thông tin để quản lý sức khỏe răng miệng của bạn.', showBackButton = true }: Props) {
    return (
        <View style={styles.header}>
            {showBackButton && (
                <Link href="/" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Image
                            source={require('@/assets/images/back.png')}
                            style={styles.backButtonIcon}
                            contentFit="contain"
                        />
                        <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
                    </TouchableOpacity>
                </Link>
            )}
            <ThemedText type="title" style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            {errorMsg ? <ThemedText style={styles.errorText}>{errorMsg}</ThemedText> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 48,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    backButtonIcon: {
        width: 24,
        height: 24,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e3a8a',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        color: '#1e3a8a',
        marginBottom: 12,
        paddingTop: 10,
    },
    subtitle: {
        fontSize: 15,
        color: '#3b82f6',
        lineHeight: 22,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '500',
    },
});
