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

    // Form state
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

    // Effect: Kiểm tra nếu có service truyền qua từ trang ServiceDetail
    useEffect(() => {
        // 1. Phục hồi dữ liệu sau khi đăng nhập thành công
        if (location.state?.recoveredBookingData && currentStep === 1) {
            setBookingData(location.state.recoveredBookingData);
            setCurrentStep(2); // Nhảy thẳng sang bước xác nhận vì đã chọn xong ở bước 1 trước đó
            return;
        }

        // 2. Nhận dữ liệu từ trang Chi tiết dịch vụ
        if (location.state?.service && currentStep === 1) {
            const { service, subService } = location.state;
            setBookingData(prev => ({
                ...prev,
                service_id: service._id,
                service_name: service.service_name,
                sub_service_id: subService?._id || null,
                sub_service_name: subService?.sub_service_name || '',
                service_price: subService ? subService.min_price : (service.price || 0)
            }));
        }
    }, [location.state, currentStep]);

    // Toast and UI states
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step navigation
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Handle combined service + date/time selection
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
            setToast({
                show: true,
                type: 'error',
                message: 'Vui lòng đăng nhập để tiếp tục đặt lịch.'
            });
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        from: location.pathname,
                        bookingData: newBookingData
                    }
                });
            }, 1000);
            return;
        }

        setCurrentStep(2); // Sang bước Xác nhận
    };

    // Handle booking submission
    const handleSubmit = async (formData) => {
        if (!user) {
            setToast({
                show: true,
                type: 'error',
                message: 'Vui lòng đăng nhập để đặt lịch khám.'
            });
            setTimeout(() => {
                // Save current step to return back after login if possible (or just go to login)
                navigate('/login', { state: { from: '/booking' } });
            }, 1500);
            return;
        }

        const { reason, full_name, phone, email } = formData;

        try {
            setIsSubmitting(true);

            // Format data exactly for Mongoose backend requirements
            const appointmentPayload = {
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

            await appointmentService.createAppointment(appointmentPayload);

            setBookingData({
                ...bookingData,
                reason
            });

            nextStep();

            setToast({
                show: true,
                type: 'success',
                message: '✅ Đặt lịch khám thành công!'
            });
        } catch (error) {
            console.error("Booking Error: ", error);
            setToast({
                show: true,
                type: 'error',
                message: error.response?.data?.message || '❌ Lỗi khi đặt lịch. Vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stepper UI
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
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}

            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    {currentStep < 3 && (
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
                    {currentStep < 3 && (
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch khám</h1>
                            <p className="text-gray-600">Đặt lịch khám nha khoa nhanh chóng và tiện lợi</p>
                        </div>
                    )}

                    {/* Progress Stepper */}
                    {currentStep < 3 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                {steps.slice(0, 2).map((step, index) => (
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
                                        {index < 1 && (
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
                            <ServiceDateTimeStep
                                onSelect={handleCombinedSelect}
                                initialData={bookingData}
                            />
                        )}

                        {currentStep === 2 && (
                            <div className="relative">
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
                                        <p className="font-semibold text-gray-700 text-lg">Đang tiến hành đặt lịch...</p>
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
