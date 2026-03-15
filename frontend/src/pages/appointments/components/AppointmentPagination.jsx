import React from "react"

const AppointmentPagination = ({ page, setPage, limit, totalItems }) => {
    return (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[12px] text-gray-500 font-medium">
                Đang xem trang <span className="text-gray-900 font-bold">{page}</span> / {Math.ceil(totalItems / limit) || 1}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm disabled:shadow-none"
                >
                    Trang trước
                </button>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= totalItems}
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm disabled:shadow-none"
                >
                    Trang sau
                </button>
            </div>
        </div>
    )
}

export default AppointmentPagination
