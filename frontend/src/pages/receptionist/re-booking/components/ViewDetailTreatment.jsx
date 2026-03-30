import React, { useState, useEffect } from 'react';
import { 
    X, User, Phone, Mail, Calendar, 
    FileText, Activity, Stethoscope 
} from 'lucide-react';
import treatmentService from '../../../../services/treatmentService';

const ViewDetailTreatment = ({ isOpen, onClose, treatmentId, onOpenBookingModal }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && treatmentId) {
            fetchDetail();
        } else {
            setDetail(null);
            setError(null);
        }
    }, [isOpen, treatmentId]);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await treatmentService.viewTreatmentDetail(treatmentId);
            const data = response?.data?.data || response?.data;
            setDetail(data);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết phiếu điều trị:", err);
            setError("Không thể lấy thông tin chi tiết. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                
                <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Stethoscope className="text-blue-500" />
                        Chi tiết Phiếu Điều Trị
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-3 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl font-medium">
                            {error}
                        </div>
                    ) : detail ? (
                        <div className="space-y-6">
                            
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                    <User size={16} /> Thông tin Bệnh nhân
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                                        <p className="font-semibold text-slate-800 text-lg">
                                            {detail.record_id?.full_name} 
                                            <span className="text-sm font-normal text-slate-500 ml-2">
                                                ({detail.record_id?.gender ? "Nam" : "Nữ"})
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                                        <p className="font-medium text-slate-700">{formatDate(detail.record_id?.dob)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{detail.record_id?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{detail.record_id?.email || "Chưa cập nhật"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Thông tin Hồ sơ bệnh án
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-blue-400 mb-1">Tên hồ sơ</p>
                                        <p className="font-bold text-blue-900">{detail.record_id?.record_name}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-blue-400 mb-1">Chẩn đoán</p>
                                            <p className="font-medium text-blue-800">{detail.record_id?.diagnosis}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-400 mb-1">Tình trạng răng</p>
                                            <p className="font-medium text-blue-800">{detail.record_id?.tooth_status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 p-5 rounded-xl">
                                <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 flex items-center gap-2">
                                    <Activity size={16} /> Chỉ định điều trị hiện tại
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">Vị trí răng</p>
                                        <p className="font-semibold text-slate-800">{detail.tooth_position}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">Giai đoạn</p>
                                        <p className="font-semibold text-orange-600">{detail.phase}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">Số lượng</p>
                                        <p className="font-semibold text-slate-800">{detail.quantity}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">Trạng thái</p>
                                        <p className="font-semibold text-green-600">{detail.status}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Ghi chú / Yêu cầu từ Bác sĩ:</p>
                                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                                        {detail.note || "Không có ghi chú"}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>

                <div className="border-t border-slate-100 p-5 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Đóng
                    </button>
                    {detail && (
                        <button 
                            onClick={() => {
                                const formattedData = {
                                    _id: detail._id,
                                    record_info: detail.record_id
                                };
                                if(onOpenBookingModal) onOpenBookingModal(formattedData);
                            }}
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Calendar size={18} /> Lên lịch hẹn
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ViewDetailTreatment;