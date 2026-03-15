import { useState } from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useChangePassword } from '@/src/hooks/useHomeData';

export function ChangePasswordScreen() {
    const insets = useSafeAreaInsets();
    const changePasswordMutation = useChangePassword();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const canSubmit = currentPassword.length >= 1 && newPassword.length >= 6 && newPassword === confirmPassword;

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận không khớp.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        try {
            await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
            Alert.alert('Thành công', 'Mật khẩu đã được thay đổi!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            Alert.alert('Lỗi', msg);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <Image source={require('@/assets/images/back.png')} style={styles.backIcon} contentFit="contain" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Thay đổi mật khẩu</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Info hint */}
                <View style={styles.hintCard}>
                    <ThemedText style={styles.hintText}>
                        Mật khẩu mới phải có ít nhất 6 ký tự.
                    </ThemedText>
                </View>

                {/* Current Password */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Mật khẩu hiện tại</ThemedText>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Nhập mật khẩu hiện tại"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showCurrent}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrent(p => !p)}>
                            <Image
                                source={showCurrent ? require('@/assets/images/hide.png') : require('@/assets/images/view.png')}
                                style={styles.eyeIcon}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* New Password */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Mật khẩu mới</ThemedText>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showNew}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNew(p => !p)}>
                            <Image
                                source={showNew ? require('@/assets/images/hide.png') : require('@/assets/images/view.png')}
                                style={styles.eyeIcon}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    </View>
                    {newPassword.length > 0 && newPassword.length < 6 && (
                        <ThemedText style={styles.errorHint}>Mật khẩu cần ít nhất 6 ký tự</ThemedText>
                    )}
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Xác nhận mật khẩu mới</ThemedText>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showConfirm}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(p => !p)}>
                            <Image
                                source={showConfirm ? require('@/assets/images/hide.png') : require('@/assets/images/view.png')}
                                style={styles.eyeIcon}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                        <ThemedText style={styles.errorHint}>Mật khẩu xác nhận không khớp</ThemedText>
                    )}
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit || changePasswordMutation.isPending}
                    activeOpacity={0.85}
                >
                    {changePasswordMutation.isPending
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <ThemedText style={styles.submitButtonText}>Cập nhật mật khẩu</ThemedText>
                    }
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { width: 18, height: 18, tintColor: '#111827' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
    hintCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    hintText: { fontSize: 14, color: '#1D4ED8', lineHeight: 20 },
    fieldGroup: { marginBottom: 24 },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111827',
    },
    eyeButton: { paddingHorizontal: 14 },
    eyeIcon: {
        width: 20,
        height: 20,
        tintColor: '#9CA3AF',
    },
    errorHint: {
        fontSize: 13,
        color: '#EF4444',
        marginTop: 6,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#111827',
        borderRadius: 100,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: { backgroundColor: '#D1D5DB' },
    submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
