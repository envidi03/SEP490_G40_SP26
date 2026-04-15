import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRegister } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { ThemedText } from '@/src/components/ui/themed-text';
import { registerSchema } from '@/src/schemas/auth.schema';
import { errorMapper } from '@/src/utils/errorMapper';
import { Image } from 'expo-image';

export function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [localError, setLocalError] = useState<string | null>(null);

    const handleRegister = async () => {
        setLocalError(null);

        // 1. Client-side Validation
        const validation = registerSchema.safeParse({ username, full_name: fullName, email, password });
        if (!validation.success) {
            setLocalError(validation.error.issues[0].message);
            return;
        }

        try {
            // 2. Trigger Mutation
            await registerMutation.mutateAsync({
                username,
                full_name: fullName,
                email,
                password
            });

            // 3. Navigation side effect
            router.replace('/(auth)/login');
        } catch (err: any) {
            console.error('Register screen error:', err);
        }
    };

    // Derive error message 
    const errorMsg = localError || (registerMutation.error ? errorMapper(registerMutation.error).message : '');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 40) + 40, paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <AuthHeader
                    title="Đăng ký"
                    subtitle="Tạo tài khoản mới để quản lý sức khỏe răng miệng của bạn."
                    errorMsg={errorMsg}
                />

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>TÊN ĐĂNG NHẬP</ThemedText>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ít nhất 3 ký tự"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                                editable={!registerMutation.isPending}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>HỌ VÀ TÊN</ThemedText>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập họ và tên"
                                placeholderTextColor="#9CA3AF"
                                value={fullName}
                                onChangeText={setFullName}
                                editable={!registerMutation.isPending}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>EMAIL</ThemedText>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="example@gmail.com"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!registerMutation.isPending}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>MẬT KHẨU</ThemedText>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ít nhất 8 ký tự (chữ hoa, số, kí tự đặc biệt)"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                editable={!registerMutation.isPending}
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
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, registerMutation.isPending && styles.loginButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={handleRegister}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <ThemedText style={styles.loginButtonText}>Đăng ký ngay</ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <ThemedText style={styles.registerPrompt}>Đã có tài khoản? </ThemedText>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.registerLink}>Đăng nhập</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
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
