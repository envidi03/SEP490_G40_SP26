import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const EquipmentFormModal = ({
    show,
    isEditMode,
    equipmentForm,
    setEquipmentForm,
    onSave,
    onClose
}) => {
    // State quản lý thông báo lỗi validate
    const [errorMessage, setErrorMessage] = useState('');

    // Đảm bảo equipment luôn là một mảng
    const equipmentList = equipmentForm.equipment || [];

    // Reset lỗi mỗi khi mở/đóng modal
    useEffect(() => {
        if (show) {
            setErrorMessage('');
        }
    }, [show]);

    if (!show) return null;

    // Cập nhật 1 field của 1 thiết bị cụ thể dựa theo index
    const updateEquipmentDetail = (index, field, value) => {
        if (errorMessage) setErrorMessage(''); // Xóa lỗi khi bắt đầu gõ

        const updatedList = [...equipmentList];
        updatedList[index] = {
            ...updatedList[index],
            [field]: value
        };
        setEquipmentForm({
            ...equipmentForm,
            equipment: updatedList
        });
    };

    // Thêm 1 form chi tiết thiết bị mới
    const handleAddDetail = () => {
        setEquipmentForm({
            ...equipmentForm,
            equipment: [
                ...equipmentList,
                {
                    equipment_name: '',
                    equipment_serial_number: '',
                    purchase_date: '',
                    supplier: '',
                    warranty: '',
                    status: 'READY'
                }
            ]
        });
    };

    // Xóa 1 form chi tiết thiết bị
    const handleRemoveDetail = (indexToRemove) => {
        const updatedList = equipmentList.filter((_, index) => index !== indexToRemove);
        setEquipmentForm({
            ...equipmentForm,
            equipment: updatedList
        });
        if (errorMessage) setErrorMessage('');
    };

    // Xử lý Validate trước khi Lưu
    const handleLocalSave = () => {
        // 1. Kiểm tra cấp độ Danh mục (Root)
        if (!equipmentForm.equipment_type?.trim()) {
            setErrorMessage('❌ Vui lòng nhập Loại thiết bị ở phần Thông tin chung');
            return;
        }

        // 2. Kiểm tra cấp độ Chi tiết thiết bị (Children)
        if (equipmentList.length === 0) {
            setErrorMessage('❌ Vui lòng thêm ít nhất 1 thiết bị chi tiết');
            return;
        }

        let hasError = false;
        for (let i = 0; i < equipmentList.length; i++) {
            const device = equipmentList[i];

            if (!device.equipment_name?.trim()) {
                setErrorMessage(`❌ Vui lòng nhập Tên thiết bị ở Máy #${i + 1}`);
                hasError = true; break;
            }
            if (!device.equipment_serial_number?.trim()) {
                setErrorMessage(`❌ Vui lòng nhập Số serial ở Máy #${i + 1}`);
                hasError = true; break;
            }
            if (!device.supplier?.trim()) {
                setErrorMessage(`❌ Vui lòng nhập Nhà cung cấp ở Máy #${i + 1}`);
                hasError = true; break;
            }
            if (!device.warranty) {
                setErrorMessage(`❌ Vui lòng chọn Hạn bảo hành ở Máy #${i + 1}`);
                hasError = true; break;
            }
        }

        if (hasError) return; // Dừng lại nếu có lỗi

        // Gọi hàm onSave từ cha truyền xuống
        onSave();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6 z-10">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold pr-8">
                            {isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin phân loại và chi tiết' : 'Điền thông tin để tạo thiết bị và các máy con'}
                        </p>
                    </div>

                    {/* Hiển thị lỗi */}
                    {errorMessage && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold flex items-center shadow-sm">
                            {errorMessage}
                        </div>
                    )}

                    {/* Form Body - Vùng cuộn */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50/50">

                        {/* PHẦN 1: THÔNG TIN PHÂN LOẠI (Root Level) */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thông tin phân loại chung</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Loại thiết bị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={equipmentForm.equipment_type || ''}
                                        onChange={(e) => {
                                            if (errorMessage) setErrorMessage('');
                                            setEquipmentForm({ ...equipmentForm, equipment_type: e.target.value });
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ví dụ: Máy X-Quang, Ghế nha khoa..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái danh mục
                                    </label>
                                    <select
                                        value={equipmentForm.status || 'ACTIVE'}
                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="ACTIVE">Đang hoạt động</option>
                                        <option value="INACTIVE">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 2: DANH SÁCH CHI TIẾT THIẾT BỊ */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">Danh sách thiết bị chi tiết</h3>
                                <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                                    Số lượng: {equipmentList.length}
                                </span>
                            </div>

                            {/* Render từng form thiết bị */}
                            {equipmentList.map((device, index) => (
                                <div key={index} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm relative group transition-all hover:border-blue-300">

                                    {/* Nút xóa form */}
                                    <button
                                        onClick={() => handleRemoveDetail(index)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                        title="Xóa thiết bị này"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                                            {index + 1}
                                        </div>
                                        Máy #{index + 1}
                                    </h4>

                                    <div className="space-y-4 pr-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Tên thiết bị <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={device.equipment_name || ''}
                                                    onChange={(e) => updateEquipmentDetail(index, 'equipment_name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Tên máy cụ thể..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Số serial <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={device.equipment_serial_number || ''}
                                                    onChange={(e) => updateEquipmentDetail(index, 'equipment_serial_number', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="SN..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày mua</label>
                                                <input
                                                    type="date"
                                                    value={device.purchase_date ? device.purchase_date.split('T')[0] : ''}
                                                    onChange={(e) => updateEquipmentDetail(index, 'purchase_date', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Nhà cung cấp <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={device.supplier || ''}
                                                    onChange={(e) => updateEquipmentDetail(index, 'supplier', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Hạn bảo hành <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={device.warranty ? device.warranty.split('T')[0] : ''}
                                                    onChange={(e) => updateEquipmentDetail(index, 'warranty', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Tình trạng <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={device.status || 'READY'}
                                                    onChange={(e) => updateEquipmentDetail(index, 'status', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="READY">Sẵn sàng</option>
                                                    <option value="IN_USE">Đang sử dụng</option>
                                                    <option value="MAINTENANCE">Bảo trì</option>
                                                    <option value="REPAIRING">Đang sửa chữa</option>
                                                    <option value="FAULTY">Bị hỏng</option>
                                                    <option value="STERILIZING">Đang khử trùng</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Nút Thêm chi tiết */}
                            <button
                                onClick={handleAddDetail}
                                className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                Thêm máy / chi tiết thiết bị mới
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 bg-white px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        {/* Gọi handleLocalSave thay vì onSave trực tiếp */}
                        <button
                            onClick={handleLocalSave}
                            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
                        >
                            {isEditMode ? 'Lưu thay đổi' : 'Tạo mới'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentFormModal;