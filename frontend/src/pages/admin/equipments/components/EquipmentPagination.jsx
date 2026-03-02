import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * EquipmentPagination - Component phân trang cho danh sách thiết bị
 * 
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {number} totalItems - Tổng số items
 * @param {number} pageSize - Số items mỗi trang
 * @param {function} onPageChange - Callback khi đổi trang
 */
const EquipmentPagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange
}) => {
    // Don't render if only 1 page or no items
    if (totalPages <= 1 || totalItems === 0) return null;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Maximum visible page numbers

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination with ellipsis
            if (currentPage <= 3) {
                // Near start
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In middle
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Items info */}
                <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold text-gray-900">{startItem}</span> - <span className="font-semibold text-gray-900">{endItem}</span> trong tổng số <span className="font-semibold text-blue-600">{totalItems}</span> thiết bị
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                    {/* First page */}
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-all ${currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        title="Trang đầu"
                    >
                        <ChevronsLeft size={20} />
                    </button>

                    {/* Previous page */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-all ${currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        title="Trang trước"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${currentPage === page
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                    </div>

                    {/* Next page */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        title="Trang sau"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Last page */}
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        title="Trang cuối"
                    >
                        <ChevronsRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentPagination;
