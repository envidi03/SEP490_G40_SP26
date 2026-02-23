import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import { ArrowLeft, Check } from 'lucide-react';

// Import step components
import ServiceSelectorStep from './components/ServiceSelectorStep';
import DateTimePickerStep from './components/DateTimePickerStep';
import BookingFormStep from './components/BookingFormStep';
import BookingConfirmation from './components/BookingConfirmation';

/**
 * BookAppointment - Main booking flow page
 * 
 * Multi-step form:
 * 1. Select Service
 * 2. Select Date & Time
 * 3. Enter Reason & Confirm
 * 4. Success Screen
 */
const BookAppointment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        service_id: null,
        service_name: '',
        service_price: 0,
        date: '',
        time: '',
        reason: ''
    });

    // Toast state
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Step navigation
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Handle service selection
    const handleServiceSelect = (service) => {
        setBookingData({
            ...bookingData,
            service_id: service.id,
            service_name: service.service_name,
            service_price: service.base_price
        });
        nextStep();
    };

    // Handle date/time selection
    const handleDateTimeSelect = (date, time) => {
        setBookingData({
            ...bookingData,
            date,
            time
        });
        nextStep();
    };

    // Handle booking submission
    const handleSubmit = (reason) => {
        setBookingData({
            ...bookingData,
            reason
        });

        // TODO: In real app, call API to create appointment
        // For now, just show success
        nextStep();

        setToast({
            show: true,
            type: 'success',
            message: '✅ Đặt lịch khám thành công!'
        });
    };

    // Stepper UI
    const steps = [
        { number: 1, label: 'Chọn dịch vụ' },
        { number: 2, label: 'Chọn ngày giờ' },
        { number: 3, label: 'Xác nhận' },
        { number: 4, label: 'Hoàn tất' }
    ];

    return (
        <PublicLayout>
            {/* Toast */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}

            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    {currentStep < 4 && (
                        <button
                            onClick={() => currentStep === 1 ? navigate(-1) : prevStep()}
                            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                            <span className="font-medium">
                                {currentStep === 1 ? 'Quay lại' : 'Bước trước'}
                            </span>
                        </button>
                    )}

                    {/* Header */}
                    {currentStep < 4 && (
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch khám</h1>
                            <p className="text-gray-600">Đặt lịch khám nha khoa nhanh chóng và tiện lợi</p>
                        </div>
                    )}

                    {/* Progress Stepper */}
                    {currentStep < 4 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                {steps.slice(0, 3).map((step, index) => (
                                    <React.Fragment key={step.number}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${currentStep >= step.number
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {currentStep > step.number ? (
                                                    <Check size={20} />
                                                ) : (
                                                    step.number
                                                )}
                                            </div>
                                            <span className={`mt-2 text-sm font-medium ${currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {currentStep === 1 && (
                            <ServiceSelectorStep onSelect={handleServiceSelect} />
                        )}

                        {currentStep === 2 && (
                            <DateTimePickerStep
                                onSelect={handleDateTimeSelect}
                                selectedService={bookingData.service_name}
                            />
                        )}

                        {currentStep === 3 && (
                            <BookingFormStep
                                bookingData={bookingData}
                                onSubmit={handleSubmit}
                            />
                        )}

                        {currentStep === 4 && (
                            <BookingConfirmation
                                bookingData={bookingData}
                                onViewAppointments={() => navigate('/appointments')}
                                onBookAnother={() => {
                                    setCurrentStep(1);
                                    setBookingData({
                                        service_id: null,
                                        service_name: '',
                                        service_price: 0,
                                        date: '',
                                        time: '',
                                        reason: ''
                                    });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default BookAppointment;
