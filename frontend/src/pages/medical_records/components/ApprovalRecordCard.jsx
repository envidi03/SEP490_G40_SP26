import React, { useState } from 'react';
import { User, Calendar, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const ApprovalRecordCard = ({ record, onApprove, onReject }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        onReject(record.id, rejectionReason);
        setShowRejectModal(false);
        setRejectionReason('');
    };

    const statusConfig = {
        PENDING: { variant: 'warning', label: 'Chờ duyệt' },
        APPROVED: { variant: 'success', label: 'Đã duyệt' },
        REJECTED: { variant: 'danger', label: 'Từ chối' }
    };

    const status = statusConfig[record.status] || statusConfig.PENDING;

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{record.patientName}</h3>
                                <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <User size={16} />
                                    <span>{record.patientPhone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{record.appointmentDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{record.appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>Được tạo bởi:</strong> {record.creatorName}
                            <span className="text-blue-600 ml-2">
                                ({new Date(record.created_at).toLocaleString('vi-VN')})
                            </span>
                        </p>
                    </div>

                    {/* Record Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {record.diagnosis}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điều trị</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {record.treatment}
                            </p>
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                            <FileText size={16} />
                            {isExpanded ? 'Thu gọn' : 'Xem thêm chi tiết'}
                        </button>

                        {isExpanded && (
                            <div className="mt-3 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {record.notes || 'Không có ghi chú'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thuốc</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {record.medications || 'Không có thuốc'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rejection Reason (if rejected) */}
                    {record.status === 'REJECTED' && record.rejectionReason && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
                            <p className="text-sm text-red-700">{record.rejectionReason}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {record.status === 'PENDING' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button
                                onClick={() => onApprove(record.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle size={20} className="mr-2" />
                                Phê duyệt
                            </Button>
                            <Button
                                onClick={() => setShowRejectModal(true)}
                                variant="outline"
                                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <XCircle size={20} className="mr-2" />
                                Từ chối
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối hồ sơ</h3>
                            <p className="text-gray-600 mb-4">
                                Vui lòng nhập lý do từ chối hồ sơ của bệnh nhân <strong>{record.patientName}</strong>
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3 mt-4">
                                <Button
                                    onClick={handleReject}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    Xác nhận từ chối
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApprovalRecordCard;
