import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useState } from 'react';
import { Image } from 'expo-image';

type Props = {
    identifier: string;
    setIdentifier: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    isLoading: boolean;
    onForgotPassword?: () => void;
};

export function AuthForm({ identifier, setIdentifier, password, setPassword, isLoading, onForgotPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>TÀI KHOẢN</ThemedText>

                <View style={styles.inputRow}>
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
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>MẬT KHẨU</ThemedText>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(prev => !prev)}
                    >
                        <Image
                            source={
                                showPassword
                                    ? require('@/assets/images/hide.png')
                                    : require('@/assets/images/view.png')
                            }
                            style={styles.eyeIcon}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {onForgotPassword && (
                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={onForgotPassword}
                    disabled={isLoading}
                >
                    <ThemedText style={styles.forgotPasswordText}>
                        Quên mật khẩu?
                    </ThemedText>
                </TouchableOpacity>
            )}
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
        color: '#2563eb',
    },
    input: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1e3a8a',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e3a8a',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 16,
    },

    eyeButton: {
        paddingHorizontal: 12,
    },

    eyeIcon: {
        width: 20,
        height: 20,
        tintColor: '#60a5fa',
    },
});
