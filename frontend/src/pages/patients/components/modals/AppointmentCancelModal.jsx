import PropTypes from 'prop-types';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';

/**
 * AppointmentCancelModal - Modal xác nhận hủy lịch khám
 * Hiển thị thông tin lịch khám và yêu cầu xác nhận trước khi hủy
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onConfirm - Callback khi xác nhận hủy
 * @param {Object} appointment - Thông tin lịch khám cần hủy
 */
const AppointmentCancelModal = ({ isOpen, onClose, onConfirm, appointment }) => {
    if (!appointment) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận hủy lịch khám"
            size="md"
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Bạn có chắc chắn muốn hủy lịch khám này không?
                </p>

                {/* Appointment Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Lý do:</span>
                        <span className="text-gray-600">{appointment.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Ngày:</span>
                        <span className="text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Giờ:</span>
                        <span className="text-gray-600">{appointment.time}</span>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
                        Vui lòng liên hệ phòng khám nếu bạn muốn đặt lịch mới.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        Xác nhận hủy
                    </Button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </Modal>
    );
};

AppointmentCancelModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    appointment: PropTypes.shape({
        id: PropTypes.number,
        reason: PropTypes.string,
        date: PropTypes.string,
        time: PropTypes.string,
    })
};

export default AppointmentCancelModal;
