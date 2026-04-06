import React, { useState, useEffect } from 'react';
import { X, Activity, Calendar, FileText, Loader2 } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import inventoryService from "../../../../services/inventoryService"; 
const TreatmentDetailModal = ({ appointment, isOpen, onClose }) => {
    // State lưu trữ mapping giữa ID thuốc và Tên thuốc
    const [medicineNames, setMedicineNames] = useState({});
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

    // Fetch tên thuốc khi modal mở và có dữ liệu appointment
    useEffect(() => {
        if (!isOpen || !appointment) return;

        const fetchMedicineNames = async () => {
            const treatments = appointment.treatments_to_pay || [];
            const fetchedNames = { ...medicineNames }; // Giữ lại những tên đã fetch trước đó
            const fetchPromises = [];
            let hasNewData = false;

            treatments.forEach(treatment => {
                if (treatment.medicine_usage && treatment.medicine_usage.length > 0) {
                    treatment.medicine_usage.forEach(med => {
                        const medId = med.medicine_id;
                        // Chỉ gọi API nếu chưa có tên thuốc trong state
                        if (medId && !fetchedNames[medId]) {
                            hasNewData = true;
                            // Đánh dấu là đang tải để tránh gọi trùng lặp
                            fetchedNames[medId] = 'Đang tải...'; 
                            
                            const promise = inventoryService.getMedicineById(medId)
                                .then(response => {
                                    // Xử lý tùy theo cấu trúc trả về của axios/apiClient
                                    const resData = response.data?.data || response.data || {};
                                    fetchedNames[medId] = resData.medicine_name || 'Thuốc không xác định';
                                })
                                .catch(error => {
                                    console.error(`Lỗi khi lấy thông tin thuốc ${medId}:`, error);
                                    fetchedNames[medId] = 'Lỗi tải tên thuốc';
                                });
                            
                            fetchPromises.push(promise);
                        }
                    });
                }
            });

            if (hasNewData) {
                setIsLoadingMedicines(true);
                await Promise.all(fetchPromises);
                setMedicineNames({ ...fetchedNames });
                setIsLoadingMedicines(false);
            }
        };

        fetchMedicineNames();
    }, [appointment, isOpen]); // Chạy lại khi có appointment mới hoặc mở modal

    if (!isOpen || !appointment) return null;

    const treatments = appointment.treatments_to_pay || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'WAITING_APPROVAL': return <Badge variant="warning">Chờ duyệt</Badge>;
            case 'COMPLETED': return <Badge variant="success">Hoàn thành</Badge>;
            case 'PENDING': return <Badge variant="primary">Đang chờ</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Chi Tiết Dịch Vụ Cần Thanh Toán</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Khách hàng: <span className="font-semibold text-gray-700">{appointment.full_name}</span> - SĐT: {appointment.phone}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Modal (Scrollable) */}
                <div className="p-5 overflow-y-auto bg-gray-50 flex-1">
                    {treatments.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 bg-white rounded-lg border border-dashed border-gray-300">
                            <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                            <p>Không có dịch vụ nào cần thanh toán.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {treatments.map((treatment, index) => (
                                <div key={treatment._id || index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                <Activity size={18} className="text-primary-500" />
                                                Vị trí: {treatment.tooth_position || 'Không xác định'}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> 
                                                    {treatment.planned_date ? new Date(treatment.planned_date).toLocaleDateString('vi-VN') : '---'}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded font-medium">
                                                    Giai đoạn: {treatment.phase}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-red-600">
                                                {(treatment.price || 0).toLocaleString('vi-VN')}đ
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 font-medium">
                                                Số lượng: {treatment.quantity || 1}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-3">
                                        <div className="flex-1">
                                            {treatment.note && (
                                                <div className="text-sm text-gray-700 flex items-start gap-2 bg-yellow-50/50 border border-yellow-100 p-2.5 rounded-md">
                                                    <FileText size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                                    <span><span className="font-medium">Ghi chú bác sĩ:</span> {treatment.note}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            {getStatusBadge(treatment.status)}
                                        </div>
                                    </div>
                                    
                                    {/* Hiển thị danh sách thuốc đi kèm */}
                                    {treatment.medicine_usage && treatment.medicine_usage.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Thuốc kê kèm (Chưa tính giá vào DV):
                                                </p>
                                                {isLoadingMedicines && <Loader2 size={12} className="animate-spin text-gray-400" />}
                                            </div>
                                            <div className="bg-gray-50 rounded p-3">
                                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
                                                    {treatment.medicine_usage.map(med => (
                                                        <li key={med._id}>
                                                            Tên thuốc: <span className="font-medium text-primary-700">
                                                                {medicineNames[med.medicine_id] || 'Đang tải...'}
                                                            </span>
                                                            <span className="mx-2 text-gray-400">|</span> 
                                                            Số lượng: <span className="font-medium">{med.quantity}</span>
                                                            {med.usage_instruction && (
                                                                <>
                                                                    <span className="mx-2 text-gray-400">|</span>
                                                                    HDSD: {med.usage_instruction}
                                                                </>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TreatmentDetailModal;