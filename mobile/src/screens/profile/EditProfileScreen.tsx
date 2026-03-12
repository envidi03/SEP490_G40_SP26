import { useState } from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';
import { useProfileData, useUpdateProfile } from '@/src/hooks/useHomeData';
import { format, parseISO } from 'date-fns';

const GENDERS = [
    { label: 'Nam', value: 'MALE' },
    { label: 'Nữ', value: 'FEMALE' },
    { label: 'Khác', value: 'OTHER' },
];

export function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    const { data: profileData } = useProfileData();
    const updateProfile = useUpdateProfile();
    const profile = profileData?.data || {};

    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [gender, setGender] = useState(profile?.gender || 'MALE');
    const [dob, setDob] = useState(() => {
        try {
            if (profile?.dob) {
                const d = typeof profile.dob === 'string' ? parseISO(profile.dob) : new Date(profile.dob);
                return format(d, 'yyyy-MM-dd');
            }
        } catch (e) {
            console.log(e)
        }
        return '';
    });
    const [address, setAddress] = useState(profile?.address || '');

    const isDirty =
        fullName !== (profile?.full_name || '') ||
        gender !== (profile?.gender || 'MALE') ||
        address !== (profile?.address || '');

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Họ và tên không được để trống.');
            return;
        }
        try {
            await updateProfile.mutateAsync({
                full_name: fullName.trim(),
                gender,
                dob: dob || undefined,
                address: address.trim() || undefined,
            });
            Alert.alert('Thành công', 'Hồ sơ đã được cập nhật!', [
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
                <ThemedText style={styles.headerTitle}>Chỉnh sửa hồ sơ</ThemedText>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={updateProfile.isPending || !isDirty}
                    style={[styles.saveButton, (!isDirty || updateProfile.isPending) && styles.saveButtonDisabled]}
                >
                    {updateProfile.isPending
                        ? <ActivityIndicator size="small" color="#FFFFFF" />
                        : <ThemedText style={styles.saveButtonText}>Lưu</ThemedText>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Full Name */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Họ và tên *</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Nhập họ và tên"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Gender */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Giới tính</ThemedText>
                    <View style={styles.genderRow}>
                        {GENDERS.map(g => (
                            <TouchableOpacity
                                key={g.value}
                                style={[styles.genderChip, gender === g.value && styles.genderChipSelected]}
                                onPress={() => setGender(g.value)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.genderChipText, gender === g.value && styles.genderChipTextSelected]}>
                                    {g.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Date of Birth */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Ngày sinh (yyyy-mm-dd)</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={dob}
                        onChangeText={setDob}
                        placeholder="VD: 1995-06-15"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                {/* Address */}
                <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Địa chỉ</ThemedText>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Nhập địa chỉ"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                    />
                </View>
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
    saveButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonDisabled: { backgroundColor: '#D1D5DB' },
    saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
    fieldGroup: { marginBottom: 24 },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111827',
    },
    inputMultiline: {
        minHeight: 90,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    genderRow: { flexDirection: 'row', gap: 10 },
    genderChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    genderChipSelected: { borderColor: '#111827', backgroundColor: '#111827' },
    genderChipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    genderChipTextSelected: { color: '#FFFFFF' },
});
