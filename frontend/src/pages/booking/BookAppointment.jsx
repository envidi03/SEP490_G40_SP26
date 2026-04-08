import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

// Import step components
import ServiceDateTimeStep from './components/ServiceDateTimeStep';
import BookingFormStep from './components/BookingFormStep';
import BookingConfirmation from './components/BookingConfirmation';

const BookAppointment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [currentStep, setCurrentStep] = useState(1);

    const [bookingData, setBookingData] = useState({
        service_id: null,
        service_name: '',
        sub_service_id: null,
        sub_service_name: '',
        service_price: 0,
        date: '',
        time: '',
        reason: ''
    });

    const [toast, setToast] = useState({
        show: false,
        type: 'success',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ Helper: đảm bảo toast luôn hiển thị
    const showToast = (type, message) => {
        setToast({ show: false, type, message });

        setTimeout(() => {
            setToast({ show: true, type, message });
        }, 50);
    };

    // =============================
    // HANDLE LOCATION STATE
    // =============================
    useEffect(() => {
        const recoveredData =
            location.state?.bookingData || location.state?.recoveredBookingData;

        if (recoveredData && currentStep === 1) {
            setBookingData(recoveredData);
            setCurrentStep(2);

            const newState = { ...location.state };
            delete newState.bookingData;
            delete newState.recoveredBookingData;

            navigate(location.pathname, { state: newState, replace: true });
            return;
        }

        if (location.state?.service && currentStep === 1) {
            const { service, subService } = location.state;

            setBookingData(prev => ({
                ...prev,
                service_id: service._id,
                service_name: service.service_name,
                sub_service_id: subService?._id || null,
                sub_service_name: subService?.sub_service_name || '',
                service_price: subService
                    ? subService.min_price
                    : service.price || 0
            }));
        }
    }, [location.state, currentStep]);

    // =============================
    // STEP CONTROL
    // =============================
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // =============================
    // STEP 1: SELECT SERVICE + TIME
    // =============================
    const handleCombinedSelect = (service, subService, date, time) => {
        const newBookingData = {
            ...bookingData,
            service_id: service._id,
            service_name: service.service_name,
            sub_service_id: subService._id,
            sub_service_name: subService.sub_service_name,
            service_price: subService.min_price,
            date,
            time
        };

        setBookingData(newBookingData);

        if (!user) {
            showToast('error', 'Vui lòng đăng nhập để tiếp tục đặt lịch.');

            setTimeout(() => {
                navigate('/login', {
                    state: {
                        from: location.pathname,
                        bookingData: newBookingData
                    }
                });
            }, 1200);

            return;
        }

        setCurrentStep(2);
    };

    // =============================
    // STEP 2: SUBMIT BOOKING
    // =============================
    const handleSubmit = async (formData) => {
        if (!user) {
            showToast('error', 'Vui lòng đăng nhập để đặt lịch.');

            setTimeout(() => {
                navigate('/login', { state: { from: '/booking' } });
            }, 1200);

            return;
        }

        const { reason, full_name, phone, email } = formData;

        try {
            setIsSubmitting(true);

            const payload = {
                full_name,
                phone,
                email,
                appointment_date: bookingData.date,
                appointment_time: bookingData.time,
                reason,
                book_service: [
                    {
                        service_id: bookingData.service_id,
                        sub_service_id: bookingData.sub_service_id,
                        unit_price: bookingData.service_price
                    }
                ]
            };

            await appointmentService.createAppointment(payload);

            setBookingData(prev => ({
                ...prev,
                reason
            }));

            showToast('success', 'Đặt lịch khám thành công!');

            nextStep();

        } catch (error) {
            console.error('Booking Error:', error.response?.data?.message);

            showToast(
                'error',
                error.response?.data?.message ||
                'Lỗi khi đặt lịch. Vui lòng thử lại.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // =============================
    // UI
    // =============================
    const steps = [
        { number: 1, label: 'Chọn dịch vụ & thời gian' },
        { number: 2, label: 'Xác nhận' },
        { number: 3, label: 'Hoàn tất' }
    ];

    return (
        <PublicLayout>

            {/* Toast */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    duration={3000}
                />
            )}

            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Back */}
                    {currentStep < 3 && (
                        <button
                            onClick={() =>
                                currentStep === 1 ? navigate(-1) : prevStep()
                            }
                            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} />
                            <span>
                                {currentStep === 1 ? 'Quay lại' : 'Bước trước'}
                            </span>
                        </button>
                    )}

                    {/* Header */}
                    {currentStep < 3 && (
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold">
                                Đặt lịch khám
                            </h1>
                            <p className="text-gray-600">
                                Nhanh chóng và tiện lợi
                            </p>
                        </div>
                    )}

                    {/* Step */}
                    {currentStep < 3 && (
                        <div className="mb-8 flex justify-between">
                            {steps.slice(0, 2).map((step) => (
                                <div key={step.number} className="text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.number
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200'
                                        }`}>
                                        {currentStep > step.number ? <Check /> : step.number}
                                    </div>
                                    <p className="text-sm mt-2">{step.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white p-8 rounded-2xl shadow">

                        {currentStep === 1 && (
                            <ServiceDateTimeStep
                                onSelect={handleCombinedSelect}
                                initialData={bookingData}
                            />
                        )}

                        {currentStep === 2 && (
                            <div className="relative">

                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin w-8 h-8" />
                                    </div>
                                )}

                                <BookingFormStep
                                    user={user}
                                    bookingData={bookingData}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
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