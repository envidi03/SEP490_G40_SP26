import React, { useState, useEffect } from 'react';
import serviceService from '../../../../services/serviceService';
import { Loader2 } from 'lucide-react';

const RoomFormModal = ({
    show,
    isEditMode,
    roomForm,
    setRoomForm,
    onClose,
    onSave,
}) => {
    const [servicesList, setServicesList] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Fetch danh sách dịch vụ khi mở modal
    useEffect(() => {
        if (!show) return;
        const fetchServices = async () => {
            try {
                setLoadingServices(true);
                const res = await serviceService.getAllServices({ limit: 100 });
                const data = res?.data?.data || res?.data || [];
                setServicesList(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch services:', err);
                setServicesList([]);
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, [show]);

    // Toggle chọn / bỏ chọn dịch vụ
    const handleToggleService = (serviceId) => {
        const current = roomForm.room_service || [];
        const exists = current.some(s => s.service_id === serviceId);
        const updated = exists
            ? current.filter(s => s.service_id !== serviceId)
            : [...current, { service_id: serviceId, note: '' }];
        setRoomForm({ ...roomForm, room_service: updated });
    };

    const isSelected = (serviceId) =>
        (roomForm.room_service || []).some(s => s.service_id === serviceId);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <h2 className="text-2xl font-bold">
                            {isEditMode ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin chi tiết phòng khám' : 'Điền đầy đủ thông tin để tạo phòng mới'}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Số phòng + Trạng thái */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số phòng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={roomForm.room_number}
                                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="P101"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={roomForm.status}
                                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="MAINTENANCE">Bảo trì</option>
                                    <option value="INACTIVE">Ngừng hoạt động</option>
                                </select>
                            </div>
                        </div>

                        {/* Dịch vụ phòng khám */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Dịch vụ phòng khám
                                <span className="ml-2 text-xs font-normal text-gray-400">(Chọn các dịch vụ có thể thực hiện tại phòng này)</span>
                            </label>

                            {loadingServices ? (
                                <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl border border-gray-200 py-8 text-gray-500">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-sm">Đang tải danh sách dịch vụ...</span>
                                </div>
                            ) : servicesList.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl border border-gray-200 py-8 text-center text-sm text-gray-400">
                                    Không có dịch vụ nào
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-56 overflow-y-auto custom-scrollbar">
                                        {servicesList.map(svc => {
                                            const id = svc._id || svc.id;
                                            return (
                                                <label
                                                    key={id}
                                                    className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(id)}
                                                        onChange={() => handleToggleService(id)}
                                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-all"
                                                    />
                                                    <span className="text-sm text-gray-700 leading-tight">{svc.name || svc.service_name || id}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        Đã chọn: {(roomForm.room_service || []).length} dịch vụ
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ghi chú / Mô tả
                            </label>
                            <textarea
                                value={roomForm.note}
                                onChange={(e) => setRoomForm({ ...roomForm, note: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-28 resize-none"
                                placeholder="Nhập ghi chú thêm về phòng này..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            {isEditMode ? 'Cập nhật' : 'Thêm phòng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomFormModal;
