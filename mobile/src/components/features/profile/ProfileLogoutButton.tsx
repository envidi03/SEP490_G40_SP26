import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useAuth } from '@/src/context/AuthContext';

export function ProfileLogoutButton() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    await logout();
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
