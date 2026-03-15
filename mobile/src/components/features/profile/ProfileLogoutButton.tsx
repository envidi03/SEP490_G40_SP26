import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useLogout } from '@/src/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export function ProfileLogoutButton() {
    const logoutMutation = useLogout();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const refreshToken = await SecureStore.getItemAsync('refresh_token');
                        if (refreshToken) await logoutMutation.mutateAsync(refreshToken);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        await SecureStore.deleteItemAsync('access_token');
                        await SecureStore.deleteItemAsync('refresh_token');
                        queryClient.setQueryData(['profile'], null);
                        queryClient.clear();
                        router.replace('/(tabs)' as any);
                    }
                },
            },
        ]);
    };

    return (
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        marginTop: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 100,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    },
});
