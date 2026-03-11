import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout } from '@/src/hooks/useAuth';

export function HomeHeader({ profile, isLoading }: { profile: any, isLoading: boolean }) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const queryClient = useQueryClient();
    const logoutMutation = useLogout();

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
            setIsDropdownVisible(true);
        } else {
            router.push('/(auth)/login');
        }
    };

    const handleLogout = async () => {
        setIsDropdownVisible(false);
        try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            if (refreshToken) {
                await logoutMutation.mutateAsync(refreshToken);
            }
        } catch (error) {
            console.error('Logout API Error:', error);
            // Vẫn tiếp tục xoá dữ liệu local cho dù gọi API lỗi để đảm bảo người dùng được đăng xuất
        } finally {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');

            // Đè dữ liệu hiện tại bằng null để UI cập nhật trở về trạng thái chưa đăng nhập ngay lập tức
            queryClient.setQueryData(['profile'], null);
            queryClient.setQueryData(['appointments', 'patient'], null);

            // Xoá sạch bộ đệm toàn bộ ứng dụng
            queryClient.clear();
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

            {/* Dropdown Menu Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setIsDropdownVisible(false);
                                        // TODO: Add route to profile tab once created
                                        // router.push('/(tabs)/profile'); 
                                    }}
                                >
                                    <ThemedText style={styles.dropdownItemText}>Hồ sơ cá nhân</ThemedText>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={handleLogout}
                                >
                                    <ThemedText style={[styles.dropdownItemText, { color: '#EF4444' }]}>Đăng xuất</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 80, // Adjust based on header height
        paddingRight: 24,
    },
    dropdownMenu: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    dropdownItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    }
});
