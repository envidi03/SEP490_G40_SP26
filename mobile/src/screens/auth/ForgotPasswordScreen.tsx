import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useForgotPassword, useResetPassword } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { ThemedText } from '@/src/components/ui/themed-text';

export function ForgotPasswordScreen() {
    const insets = useSafeAreaInsets();
    const forgotMutation = useForgotPassword();
    const resetMutation = useResetPassword();

    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1
    const [email, setEmail] = useState('');
    
    // Step 2
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleRequestOTP = async () => {
        if (!email) {
            setErrorMsg('Vui lòng nhập email');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg('');

            await forgotMutation.mutateAsync(email);
            setStep(2);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            const msg = err.response?.data?.message || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng kiểm tra lại email.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            setErrorMsg('Vui lòng nhập mã OTP và mật khẩu mới');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg('');

            await resetMutation.mutateAsync({ email, otp, newPassword });
            
            // Redirect to login after successful reset
            router.replace('/login');
        } catch (err: any) {
            console.error('Reset password error:', err);
            const msg = err.response?.data?.message || 'Thiết lập mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    }

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
                    title="Quên mật khẩu" 
                    subtitle={
                        step === 1 
                        ? "Nhập email của bạn để nhận mã xác nhận đổi mật khẩu."
                        : "Vui lòng kiểm tra email để lấy mã OTP và tạo mật khẩu mới."
                    } 
                    errorMsg={errorMsg} 
                />

                <View style={styles.formContainer}>
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
                            editable={!isLoading && step === 1}
                        />
                    </View>

                    {step === 2 && (
                        <>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>MÃ XÁC NHẬN (OTP)</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã OTP"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={otp}
                                    onChangeText={setOtp}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>MẬT KHẨU MỚI</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu mới"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={true}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    editable={!isLoading}
                                />
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={step === 1 ? handleRequestOTP : handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <ThemedText style={styles.loginButtonText}>
                                {step === 1 ? "Nhận mã OTP" : "Đổi mật khẩu"}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.registerLink}>Quay lại đăng nhập</ThemedText>
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
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e3a8a',
    }
});
