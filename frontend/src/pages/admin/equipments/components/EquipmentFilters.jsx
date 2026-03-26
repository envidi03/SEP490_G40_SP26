import React, { useState } from 'react';
import { Search, Filter, Layers, RotateCcw } from 'lucide-react';

const EquipmentFilters = ({ onSearch }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [localCategoryStatus, setLocalCategoryStatus] = useState('');
    const [localItemStatus, setLocalItemStatus] = useState('');

    // 💡 TỐI ƯU UX WRITING: Viết ngắn gọn, có tiền tố chỉ định rõ ràng
    const categoryStatusOptions = [
        { value: '', label: 'Danh mục: Tất cả' },
        { value: 'ACTIVE', label: 'Danh mục: Hoạt động' },
        { value: 'INACTIVE', label: 'Danh mục: Ngừng HĐ' }
    ];

    const itemStatusOptions = [
        { value: '', label: 'Máy: Tất cả' },
        { value: 'READY', label: 'Máy: Sẵn sàng' },
        { value: 'IN_USE', label: 'Máy: Đang dùng' },
        { value: 'MAINTENANCE', label: 'Máy: Bảo trì' },
        { value: 'REPAIRING', label: 'Máy: Đang sửa' },
        { value: 'FAULTY', label: 'Máy: Bị hỏng' },
        { value: 'STERILIZING', label: 'Máy: Khử trùng' }
    ];

    const handleApplyFilter = () => {
        if (onSearch) {
            onSearch({
                searchTerm: localSearch,
                categoryStatus: localCategoryStatus,
                itemStatus: localItemStatus
            });
        }
    };

    const handleClearFilter = () => {
        setLocalSearch('');
        setLocalCategoryStatus('');
        setLocalItemStatus('');
        if (onSearch) {
            onSearch({
                searchTerm: '',
                categoryStatus: '',
                itemStatus: ''
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleApplyFilter();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            {/* Đổi thành flex-wrap để nếu màn hình hơi nhỏ nó tự rớt dòng đẹp mắt */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                
                {/* 1. Ô Tìm kiếm (Search) */}
                <div className="relative flex-1 w-full min-w-[250px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="search"
                        placeholder="Tìm tên máy, số serial, nhà cung cấp..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>

                {/* Cụm Select và Nút bấm (Luôn bám nhau) */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto shrink-0">
                    
                    {/* 2. Select: Trạng thái Danh Mục */}
                    {/* 💡 Sửa thành w-[210px] để có độ rộng cố định, không bị méo */}
                    <div className="relative w-full md:w-[210px]">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                            <Layers size={18} />
                        </div>
                        <select
                            value={localCategoryStatus}
                            onChange={(e) => setLocalCategoryStatus(e.target.value)}
                            title="Lọc theo trạng thái danh mục"
                            className="w-full pl-11 pr-10 py-2.5 border border-blue-200 bg-blue-50 text-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-semibold text-sm truncate"
                        >
                            {categoryStatusOptions.map(({ value, label }) => (
                                <option key={`cat-${value}`} value={value} className="font-medium text-gray-700 py-2">
                                    {label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* 3. Select: Trạng thái Từng Máy */}
                    <div className="relative w-full md:w-[200px]">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Filter size={18} />
                        </div>
                        <select
                            value={localItemStatus}
                            onChange={(e) => setLocalItemStatus(e.target.value)}
                            title="Lọc theo trạng thái thiết bị con"
                            className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white text-gray-700 cursor-pointer font-medium text-sm truncate"
                        >
                            {itemStatusOptions.map(({ value, label }) => (
                                <option key={`item-${value}`} value={value} className="font-medium text-gray-700 py-2">
                                    {label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* 4. Cụm Nút Action (Tìm kiếm & Xóa lọc) */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={handleApplyFilter}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
                        >
                            <Search size={18} />
                            <span>Lọc</span>
                        </button>
                        <button
                            onClick={handleClearFilter}
                            className="flex-none flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            title="Xóa tất cả bộ lọc"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EquipmentFilters;