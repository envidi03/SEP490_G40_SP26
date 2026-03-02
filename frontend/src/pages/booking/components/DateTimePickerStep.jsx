import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

const DateTimePickerStep = ({ onSelect, selectedService }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Generate available time slots
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ];

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get maximum date (3 months from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split('T')[0];
    };

    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            onSelect(selectedDate, selectedTime);
        }
    };

    // Format date display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn ngày và giờ khám</h2>
            <p className="text-gray-600 mb-6">
                Dịch vụ: <span className="font-semibold text-primary-600">{selectedService}</span>
            </p>

            <div className="space-y-6">
                {/* Date Picker */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <Calendar size={18} className="text-primary-600" />
                        Chọn ngày khám
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {selectedDate && (
                        <p className="mt-2 text-sm text-gray-600">
                            {formatDateDisplay(selectedDate)}
                        </p>
                    )}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <Clock size={18} className="text-primary-600" />
                            Chọn giờ khám
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 rounded-lg font-medium transition-all ${selectedTime === time
                                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                {selectedDate && selectedTime && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <h3 className="font-semibold text-primary-900 mb-2">Thời gian đã chọn:</h3>
                        <p className="text-primary-700">
                            <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                            {' '}vào lúc{' '}
                            <span className="font-medium">{selectedTime}</span>
                        </p>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

export default DateTimePickerStep;
