import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    identifier: string;
    setIdentifier: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    isLoading: boolean;
};

export function AuthForm({ identifier, setIdentifier, password, setPassword, isLoading }: Props) {
    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>TÀI KHOẢN</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Email hoặc tên đăng nhập"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={identifier}
                    onChangeText={setIdentifier}
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>MẬT KHẨU</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>Quên mật khẩu?</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        gap: 24,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#4B5563',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#111827',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});
