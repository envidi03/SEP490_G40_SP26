import React, { useState } from 'react';
import { PackageX, ChevronDown, ChevronUp, Plus } from 'lucide-react'; 
import EquipmentCard from './EquipmentCard';

const EquipmentGrid = ({
    filteredEquipment, // Dữ liệu bây giờ là mảng các Danh mục (Loại thiết bị)
    loading,
    equipmentUsage,
    onViewDetails,
    onViewUsage,
    onEdit,
    onDelete,
    getStatusColor,
    getStatusText,
    formatDate,
    searchTerm,
    statusFilter
}) => {
    // State quản lý trạng thái đóng/mở của các nhóm (Mặc định ĐÓNG)
    const [openGroups, setOpenGroups] = useState({});

    // Hàm toggle: nếu chưa có (undefined) thì !undefined = true (mở), ngược lại thì đảo trạng thái
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
            {/* Lặp qua từng Danh mục (Equipment Type) */}
            {filteredEquipment.map(category => {
                const categoryId = category._id || category.id;
                
                // MẶC ĐỊNH ĐÓNG: Chỉ khi state là true thì mới mở
                // Nếu chưa click bao giờ (undefined) thì isOpen sẽ là false
                const isOpen = openGroups[categoryId] === true;

                return (
                    <div key={categoryId} className="bg-transparent mb-4">
                        {/* 1. THẺ TIÊU ĐỀ THEO HÀNG NGANG (Click để gập/mở) */}
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
                                {/* Trạng thái danh mục ACTIVE / INACTIVE */}
                                {category.status && (
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                        category.status === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-700 border-green-200' 
                                            : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {category.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                )}

                                {/* Nút Thêm Thiết Bị */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // QUAN TRỌNG: Chặn sự kiện click để không gập/mở thẻ cha
                                        // TODO: Gọi hàm mở Modal thêm thiết bị con ở đây
                                        console.log("Mở modal thêm thiết bị cho category:", categoryId);
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

                        {/* 2. LƯỚI DANH SÁCH CÁC THIẾT BỊ CON (Chỉ hiển thị khi isOpen = true) */}
                        {isOpen && category.equipment && category.equipment.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pl-4 border-l-2 border-blue-100 ml-2">
                                {category.equipment.map(equip => {
                                    const equipId = equip._id || equip.id;
                                    const usageCount = equipmentUsage?.filter(u => u.equipment_id === equipId).length || 0;

                                    // QUAN TRỌNG: Gộp thông tin thằng cha vào thằng con 
                                    // để các Modal Action cũ của bạn vẫn lấy được equipment_type và categoryId
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
                                            onEdit={onEdit}
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