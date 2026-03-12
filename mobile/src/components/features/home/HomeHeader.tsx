import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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

    // Check if user is logged in based on avatarUrl presence
    // (This works as a quick UI check based on your profile structure)
    const isLoggedIn = !!profile?.avatar_url;

    const handleAvatarPress = () => {
        if (isLoggedIn) {
            router.push('/profile' as any);
        } else {
            router.push('/(auth)/login');
        }
    };

    // Default abstract avatar style if no image
    const AbstractAvatar = (
        <View style={styles.defaultAvatarBadge}>
            <ThemedText style={styles.defaultAvatarInitial}>
                {userName.charAt(0).toUpperCase()}
            </ThemedText>
        </View>
    );

    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.greeting}>{isLoggedIn ? 'Xin chào,' : 'Chào mừng,'}</ThemedText>
                <ThemedText type="title" style={styles.userName}>{userName}</ThemedText>
                {!isLoggedIn && (
                    <ThemedText style={styles.loginHint}>Nhấn vào đây để đăng nhập</ThemedText>
                )}
            </View>
            <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7} onPress={handleAvatarPress}>
                {isLoggedIn ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                ) : (
                    AbstractAvatar
                )}
                {isLoggedIn && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
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
    loginHint: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    defaultAvatarBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F3F4F6',
    },
    defaultAvatarInitial: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
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
    },
});
