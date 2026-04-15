import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogin } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { AuthForm } from '@/src/components/features/auth/AuthForm';
import { AuthAction } from '@/src/components/features/auth/AuthAction';
import { useAuth } from '@/src/context/AuthContext';
import { loginSchema } from '@/src/schemas/auth.schema';
import { errorMapper } from '@/src/utils/errorMapper';

export function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { setAuth } = useAuth();
    const loginMutation = useLogin();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLocalError(null);

        // 1. Client-side Validation using Zod
        const validation = loginSchema.safeParse({ identifier, password });
        if (!validation.success) {
            setLocalError(validation.error.issues[0].message);
            return;
        }

        try {
            // 2. Trigger Mutation
            const user = await loginMutation.mutateAsync({ identifier, password });

            // 3. Update Global Auth State
            setAuth(user);
        } catch (err) {
            // Error is handled by React Query state (loginMutation.error)
            if (__DEV__) {
                console.error('Login screen error:', err);
            }
        }
    };

    // Derive error message for display
    const errorMsg = localError || (loginMutation.error ? errorMapper(loginMutation.error).message : '');

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
                <AuthHeader errorMsg={errorMsg} showBackButton={false} />

                <AuthForm
                    identifier={identifier}
                    setIdentifier={setIdentifier}
                    password={password}
                    setPassword={setPassword}
                    isLoading={loginMutation.isPending}
                    onForgotPassword={() => router.push('/(auth)/forgot-password')}
                />

                <AuthAction
                    isLoading={loginMutation.isPending}
                    onLogin={handleLogin}
                    onRegister={() => router.push('/(auth)/register')}
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
