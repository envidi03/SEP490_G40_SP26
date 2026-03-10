import React from "react"
import AppointmentSearchBar from "./AppointmentSearchBar"

const AppointmentFilters = ({
    searchTerm,
    onSearchChange,
    sortOrder,
    onSortChange,
    onClearFilters
}) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm space-y-4">
            <AppointmentSearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                    <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Sắp xếp ngày hẹn</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white outline-none cursor-pointer"
                    >
                        <option value="">Không sắp xếp</option>
                        <option value="asc">Cũ nhất đến Mới nhất</option>
                        <option value="desc">Mới nhất đến Cũ nhất</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AppointmentFilters
