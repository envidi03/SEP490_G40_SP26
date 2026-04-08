import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    isLoading: boolean;
    onLogin: () => void;
    onRegister?: () => void;
};

export function AuthAction({ isLoading, onLogin, onRegister }: Props) {
    return (
        <View style={styles.actionContainer}>
            <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                activeOpacity={0.8}
                onPress={onLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
                )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
                <ThemedText style={styles.registerPrompt}>Chưa có tài khoản? </ThemedText>
                <TouchableOpacity onPress={onRegister}>
                    <ThemedText style={styles.registerLink}>Đăng ký ngay</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        gap: 24,
    },
    loginButton: {
        backgroundColor: '#2563eb',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    loginButtonDisabled: {
        backgroundColor: '#2563eb',
        opacity: 0.8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerPrompt: {
        fontSize: 15,
        color: '#3b82f6',
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e3a8a',
    }
});
