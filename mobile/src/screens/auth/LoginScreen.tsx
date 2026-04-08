import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { useLogin } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { AuthForm } from '@/src/components/features/auth/AuthForm';
import { AuthAction } from '@/src/components/features/auth/AuthAction';

export function LoginScreen() {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        if (!identifier || !password) {
            setErrorMsg('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg('');

            // Call real login API using mutation instead of useQuery directly
            const responseData = await loginMutation.mutateAsync({ identifier, password });

            // Extract tokens (adjust fields based on your backend response structure)
            const resData = responseData?.data as any;
            const accessToken = resData?.token;
            const refreshToken = resData?.refreshToken;
            const roleName = resData?.role?.name;

            if (roleName !== 'PATIENT') {
                setErrorMsg('Tài khoản của bạn không được cấp quyền truy cập ứng dụng này.');
                return;
            }

            if (accessToken) {
                await SecureStore.setItemAsync('access_token', accessToken);
                if (refreshToken) {
                    await SecureStore.setItemAsync('refresh_token', refreshToken);
                }

                // Invalidate profile query to refetch authenticated data
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });

                router.replace('/');
            } else {
                setErrorMsg('Không nhận được token từ máy chủ. Vui lòng thử lại.');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.';
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
                <AuthHeader errorMsg={errorMsg} />

                <AuthForm
                    identifier={identifier}
                    setIdentifier={setIdentifier}
                    password={password}
                    setPassword={setPassword}
                    isLoading={isLoading}
                    onForgotPassword={() => router.push('/forgot-password')}
                />

                <AuthAction
                    isLoading={isLoading}
                    onLogin={handleLogin}
                    onRegister={() => router.push('/register')}
                />
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
});
