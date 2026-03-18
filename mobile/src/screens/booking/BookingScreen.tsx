import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/themed-text';
import { Image } from 'expo-image';
import { useProfileData } from '@/src/hooks/useHomeData';

import { BookingStep1_Services } from '@/src/components/features/booking/BookingStep1_Services';
import { BookingStep2_DateTime } from '@/src/components/features/booking/BookingStep2_DateTime';
import { BookingStep3_Confirm } from '@/src/components/features/booking/BookingStep3_Confirm';

type Props = {
    initialServiceId?: string;
    initialSubServiceId?: string;
};

export type BookingState = {
    selectedServices: { _id: string; service_name: string; price: number; sub_service_id?: string; sub_service_name?: string }[];
    selectedDate: string;
    selectedTime: string;
};

export function BookingScreen({ initialServiceId, initialSubServiceId }: Props) {
    const insets = useSafeAreaInsets();
    const { data: profileData } = useProfileData();
    const profile = profileData?.data || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState<BookingState>({
        selectedServices: [],
        selectedDate: '',
        selectedTime: '',
    });

    const canProceed = () => {
        if (currentStep === 1) {
            return bookingData.selectedServices.length > 0;
        }
        if (currentStep === 2) {
            return bookingData.selectedDate !== '' && bookingData.selectedTime !== '';
        }
        return true;
    };

    const handleNext = () => {
        if (canProceed() && currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const stepTitles = [
        "Chọn dịch vụ",
        "Chọn thời gian",
        "Xác nhận thông tin"
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                    <Image
                        source={require('@/assets/images/back.png')}
                        style={styles.backIcon}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitle}>{stepTitles[currentStep - 1]}</ThemedText>
                    <ThemedText style={styles.stepIndicator}>Bước {currentStep} / 3</ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.stepperContainer}>
                <View style={styles.stepperTrack}>
                    <View style={[styles.stepperFill, { width: `${(currentStep / 3) * 100}%` }]} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.contentArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 1 && (
                        <BookingStep1_Services
                            initialServiceId={initialServiceId}
                            initialSubServiceId={initialSubServiceId}
                            bookingData={bookingData}
                            setBookingData={setBookingData}
                        />
                    )}

                    {currentStep === 2 && (
                        <BookingStep2_DateTime
                            bookingData={bookingData}
                            setBookingData={setBookingData}
                        />
                    )}

                    {currentStep === 3 && (
                        <BookingStep3_Confirm
                            bookingData={bookingData}
                            profile={profile}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {currentStep < 3 && (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <TouchableOpacity
                        style={[styles.primaryButton, !canProceed() && styles.primaryButtonDisabled]}
                        activeOpacity={0.9}
                        onPress={handleNext}
                        disabled={!canProceed()}
                    >
                        <ThemedText style={styles.primaryButtonText}>Tiếp tục</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 18,
        height: 18,
        tintColor: '#2563eb',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    stepIndicator: {
        fontSize: 13,
        color: '#3b82f6',
        marginTop: 4,
    },
    stepperContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    stepperTrack: {
        height: 6,
        backgroundColor: '#dbeafe',
        borderRadius: 3,
        overflow: 'hidden',
    },
    stepperFill: {
        height: '100%',
        backgroundColor: '#2563eb',
        borderRadius: 3,
    },
    contentArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#dbeafe',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        height: 56,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        backgroundColor: '#bfdbfe',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
