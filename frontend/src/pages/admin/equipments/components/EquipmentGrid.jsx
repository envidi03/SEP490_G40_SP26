import React, { useState } from 'react';
// THÊM: Import icon Edit
import { PackageX, ChevronDown, ChevronUp, Plus, Edit } from 'lucide-react';
import EquipmentCard from './EquipmentCard';

const EquipmentGrid = ({
    filteredEquipment,
    loading,
    equipmentUsage,
    onViewDetails,
    onViewUsage,
    onDelete,
    getStatusColor,
    getStatusText,
    formatDate,
    searchTerm,
    statusFilter,
    onOpenAddChildModal,
    onEditCategory // THÊM: Prop nhận hàm sửa danh mục từ cha
}) => {
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (categoryId) => {
        setOpenGroups(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (filteredEquipment.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <PackageX size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Không tìm thấy thiết bị
                </h3>
                <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                        ? 'Không có thiết bị nào phù hợp với bộ lọc của bạn'
                        : 'Chưa có thiết bị nào trong hệ thống'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {filteredEquipment.map(category => {
                const categoryId = category._id || category.id;
                const isOpen = openGroups[categoryId] === true;

                return (
                    <div key={categoryId} className="bg-transparent mb-4">
                        {/* 1. THẺ TIÊU ĐỀ THEO HÀNG NGANG */}
                        <div
                            onClick={() => toggleGroup(categoryId)}
                            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {category.equipment_type}
                                    </h2>
                                    <span className="text-sm text-gray-500 font-medium">
                                        Tổng cộng: {category.equipment?.length || 0} thiết bị
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Trạng thái danh mục */}
                                {category.status && (
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${category.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                        {category.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                )}

                                {/* THÊM: Nút Sửa Toàn bộ Danh Mục (Mở Form Modal to) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onEditCategory) onEditCategory(category);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg text-sm font-semibold transition-colors border border-amber-100"
                                >
                                    <Edit size={16} />
                                    <span>Sửa</span>
                                </button>

                                {/* Nút Thêm Thiết Bị Mới vào Danh mục */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onOpenAddChildModal) onOpenAddChildModal(category);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-semibold transition-colors border border-blue-100"
                                >
                                    <Plus size={16} />
                                    <span>Thêm thiết bị</span>
                                </button>

                                {/* Nút mũi tên gập/mở */}
                                <div className="p-1.5 bg-gray-100 rounded-full text-gray-600 ml-1">
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* 2. LƯỚI DANH SÁCH CÁC THIẾT BỊ CON */}
                        {isOpen && category.equipment && category.equipment.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pl-4 border-l-2 border-blue-100 ml-2">
                                {category.equipment.map(equip => {
                                    const equipId = equip._id || equip.id;
                                    const usageCount = equipmentUsage?.filter(u => u.equipment_id === equipId).length || 0;

                                    const equipWithCategoryData = {
                                        ...equip,
                                        categoryId: categoryId,
                                        equipment_type: category.equipment_type
                                    };

                                    return (
                                        <EquipmentCard
                                            key={equipId}
                                            equipment={equipWithCategoryData}
                                            usageCount={usageCount}
                                            onViewDetails={onViewDetails}
                                            onViewUsage={onViewUsage}
                                            // Nếu user bấm "Sửa" ở từng Card, ta cũng mở Modal của cả category lên
                                            onEdit={() => onEditCategory(category)}
                                            onDelete={onDelete}
                                            getStatusColor={getStatusColor}
                                            getStatusText={getStatusText}
                                            formatDate={formatDate}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default EquipmentGrid;