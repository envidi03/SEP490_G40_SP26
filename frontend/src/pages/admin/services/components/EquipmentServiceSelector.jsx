import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import equipmentService from '../../../../services/equipmentService';

/**
 * EquipmentServiceSelector - Component để chọn và quản lý thiết bị cần thiết cho dịch vụ
 * 
 * @param {Array} equipmentServices - Mảng các thiết bị đã chọn [{equipment_id, required_qty, note}]
 * @param {Function} setEquipmentServices - Function để update equipment services
 */
const EquipmentServiceSelector = ({ equipmentServices = [], setEquipmentServices }) => {
    const [availableEquipments, setAvailableEquipments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            // Filter by READY status
            const response = await equipmentService.getEquipments({
                filter: 'READY',
                limit: 100  // Get more to support search
            });
            setAvailableEquipments(response.data || []);
        } catch (error) {
            console.error('Error fetching equipments:', error);
            setAvailableEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEquipment = () => {
        setEquipmentServices([
            ...equipmentServices,
            {
                equipment_id: '',
                required_qty: 1,
                note: ''
            }
        ]);
    };

    const handleRemoveEquipment = (index) => {
        setEquipmentServices(equipmentServices.filter((_, i) => i !== index));
    };

    const handleEquipmentChange = (index, field, value) => {
        const updated = [...equipmentServices];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setEquipmentServices(updated);
    };

    // Filter equipments based on search term
    const filteredEquipments = availableEquipments.filter(eq =>
        eq.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get already selected equipment IDs
    const selectedIds = equipmentServices.map(es => es.equipment_id).filter(Boolean);

    // Filter out already selected equipments from dropdown
    const getAvailableForDropdown = (currentId) => {
        return filteredEquipments.filter(eq =>
            eq._id === currentId || !selectedIds.includes(eq._id)
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                    Thiết bị cần thiết (Tùy chọn)
                </label>
                <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Plus size={16} />
                    <span>Thêm thiết bị</span>
                </button>
            </div>

            {/* Equipment List */}
            {equipmentServices.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">Chưa có thiết bị nào. Nhấn "Thêm thiết bị" để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {equipmentServices.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                            {/* Equipment Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Thiết bị <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={item.equipment_id}
                                    onChange={(e) => handleEquipmentChange(index, 'equipment_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                                    required
                                >
                                    <option value="">-- Chọn thiết bị --</option>
                                    {getAvailableForDropdown(item.equipment_id).map(eq => (
                                        <option key={eq._id} value={eq._id}>
                                            {eq.equipment_name} ({eq.equipment_type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Quantity */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                        Số lượng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={item.required_qty}
                                        onChange={(e) => handleEquipmentChange(index, 'required_qty', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                        min="1"
                                        required
                                    />
                                </div>

                                {/* Remove Button */}
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEquipment(index)}
                                        className="w-full px-3 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Trash2 size={14} />
                                        <span>Xóa</span>
                                    </button>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Ghi chú
                                </label>
                                <input
                                    type="text"
                                    value={item.note || ''}
                                    onChange={(e) => handleEquipmentChange(index, 'note', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                    placeholder="Thông tin bổ sung (không bắt buộc)"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <p className="text-sm text-gray-500 text-center">Đang tải danh sách thiết bị...</p>
            )}
        </div>
    );
};

export default EquipmentServiceSelector;
