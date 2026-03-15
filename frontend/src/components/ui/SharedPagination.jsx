import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * SharedPagination — Component phân trang dùng chung cho toàn bộ dự án.
 *
 * Props:
 *   currentPage  (number)   — Trang hiện tại (1-indexed)
 *   totalPages   (number)   — Tổng số trang
 *   totalItems   (number)   — Tổng số bản ghi (optional)
 *   onPageChange (function) — Callback khi đổi trang, nhận pageNumber
 *   itemLabel    (string)   — Nhãn hiển thị, VD: "kết quả", "hồ sơ" (default: "kết quả")
 */
const SharedPagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems,
    onPageChange,
    itemLabel = 'kết quả',
}) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    // Build page numbers with ellipsis for large page counts
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // max page buttons to show at once

        if (totalPages <= maxVisible + 2) {
            // Show all pages if total is small enough
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust window near edges
            if (currentPage <= 3) {
                start = 2;
                end = Math.min(maxVisible, totalPages - 1);
            } else if (currentPage >= totalPages - 2) {
                start = Math.max(totalPages - maxVisible + 1, 2);
                end = totalPages - 1;
            }

            if (start > 2) pages.push('ellipsis-start');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('ellipsis-end');

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm">
            {/* Mobile view */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Trước
                </button>
                <span className="inline-flex items-center text-sm text-gray-500">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Sau
                </button>
            </div>

            {/* Desktop view */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Hiển thị trang{' '}
                        <span className="font-semibold">{currentPage}</span> /{' '}
                        <span className="font-semibold">{totalPages}</span>
                        {totalItems !== undefined && (
                            <span className="ml-1 text-gray-500">
                                (Tổng {totalItems.toLocaleString('vi-VN')} {itemLabel})
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
                        aria-label="Pagination"
                    >
                        {/* First page button */}
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang đầu"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>

                        {/* Prev button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang trước"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Page numbers */}
                        {pageNumbers.map((page, idx) => {
                            if (typeof page === 'string') {
                                // Ellipsis
                                return (
                                    <span
                                        key={page}
                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-300 select-none"
                                    >
                                        …
                                    </span>
                                );
                            }
                            const isCurrent = page === currentPage;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-colors ${
                                        isCurrent
                                            ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Next button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang sau"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Last page button */}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang cuối"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default SharedPagination;
