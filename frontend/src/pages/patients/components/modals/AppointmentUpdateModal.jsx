import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { Calendar, Clock, FileText } from 'lucide-react';

/**
 * AppointmentUpdateModal - Modal form cập nhật thông tin lịch khám
 * Cho phép thay đổi ngày, giờ và lý do khám
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSubmit - Callback khi submit form
 * @param {Object} formData - Dữ liệu form (date, time, reason)
 * @param {function} onChange - Callback khi thay đổi input
 */
const AppointmentUpdateModal = ({ isOpen, onClose, onSubmit, formData, onChange }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cập nhật lịch khám"
            size="md"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Date Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Ngày khám
                    </label>
                    <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => onChange({ ...formData, date: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>

                {/* Time Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Giờ khám
                    </label>
                    <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => onChange({ ...formData, time: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>

                {/* Reason Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="inline mr-1" />
                        Lý do khám
                    </label>
                    <Input
                        type="text"
                        value={formData.reason}
                        onChange={(e) => onChange({ ...formData, reason: e.target.value })}
                        placeholder="Ví dụ: Đau răng, khám định kỳ..."
                        className="w-full"
                        required
                    />
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Lưu ý:</strong> Thay đổi lịch khám cần được phòng khám xác nhận lại.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
                    >
                        Lưu thay đổi
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </Modal>
    );
};

AppointmentUpdateModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    formData: PropTypes.shape({
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        reason: PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default AppointmentUpdateModal;
