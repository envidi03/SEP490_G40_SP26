import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRegister } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { ThemedText } from '@/src/components/ui/themed-text';

export function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async () => {
        if (!username || !fullName || !email || !password) {
            setErrorMsg('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg('');

            await registerMutation.mutateAsync({
                username,
                full_name: fullName,
                email,
                password
            });

            // Redirect to login after successful registration
            router.replace('/login');
        } catch (err: any) {
            console.error('Register error:', err);
            const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

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
                    subtitle="Tạo tài khoản mới để bắt đầu sử dụng dịch vụ của chúng tôi." 
                    errorMsg={errorMsg} 
                />

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>TÊN ĐĂNG NHẬP</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên đăng nhập"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            value={username}
                            onChangeText={setUsername}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>HỌ VÀ TÊN</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên"
                            placeholderTextColor="#9CA3AF"
                            value={fullName}
                            onChangeText={setFullName}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>EMAIL</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập địa chỉ email"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
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
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
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
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 16,
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
    }
});
