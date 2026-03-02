import { X, Wrench, Calendar, AlertTriangle } from 'lucide-react';

const UpdateMaintenanceModal = ({ equipment, isOpen, onClose, onUpdate }) => {
    if (!isOpen || !equipment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            status: formData.get('status'),
            lastMaintenance: formData.get('lastMaintenance'),
            nextMaintenance: formData.get('nextMaintenance'),
            notes: formData.get('notes')
        };
        // TODO: Call API to update maintenance
        console.log('Updating maintenance:', equipment.id, data);
        if (onUpdate) {
            onUpdate(equipment.id, data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Wrench className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Cập Nhật Bảo Trì</h2>
                            <p className="text-sm text-gray-500">Cập nhật trạng thái thiết bị</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Equipment Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-600">Thiết bị</p>
                            <p className="font-medium text-gray-900">{equipment.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Mã thiết bị</p>
                            <p className="font-medium text-gray-900">{equipment.code}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Vị trí</p>
                            <p className="font-medium text-gray-900">{equipment.location}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Danh mục</p>
                            <p className="font-medium text-gray-900">{equipment.category}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            defaultValue={equipment.status}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="maintenance">Đang bảo trì</option>
                            <option value="broken">Hỏng</option>
                            <option value="inactive">Ngưng sử dụng</option>
                        </select>
                    </div>

                    {/* Maintenance Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Calendar size={14} className="mr-1" />
                                Bảo trì cuối
                            </label>
                            <input
                                type="date"
                                name="lastMaintenance"
                                defaultValue={equipment.lastMaintenance}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Calendar size={14} className="mr-1" />
                                Bảo trì tiếp theo
                            </label>
                            <input
                                type="date"
                                name="nextMaintenance"
                                defaultValue={equipment.nextMaintenance}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Ghi chú bảo trì
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Nhập ghi chú về tình trạng thiết bị, công việc bảo trì đã thực hiện..."
                        />
                    </div>

                    {/* Warning for Maintenance Status */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                            <p className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Nếu đặt trạng thái "Đang bảo trì" hoặc "Hỏng", thiết bị sẽ không khả dụng cho lịch hẹn.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                        >
                            <Wrench size={18} />
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateMaintenanceModal;
