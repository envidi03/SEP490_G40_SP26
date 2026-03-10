import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

export function HomeHeader({ profile, isLoading }: { profile: any, isLoading: boolean }) {
    if (isLoading) {
        return (
            <View style={styles.header}>
                <View>
                    <View style={[styles.skeletonText, { width: 80, height: 20, marginBottom: 8 }]} />
                    <View style={[styles.skeletonText, { width: 150, height: 30 }]} />
                </View>
                <View style={styles.skeletonAvatar} />
            </View>
        );
    }

    const userName = profile?.full_name || 'Khách hàng';
    const avatarUrl = profile?.avatar_url;

    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.greeting}>Xin chào,</ThemedText>
                <ThemedText type="title" style={styles.userName}>{userName}</ThemedText>
            </View>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={styles.notificationBadge} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    greeting: {
        fontSize: 16,
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E5E7EB',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    skeletonText: {
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    skeletonAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E5E7EB',
    }
});
