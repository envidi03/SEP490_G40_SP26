import React from 'react';
import Card from '../../../../components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UserPagination = ({ currentPage, totalPages, totalItems, currentCount, onPageChange }) => {
    if (totalPages <= 0) return null;

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <Card className="mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                    Hiển thị <span className="font-medium">{currentCount}</span> trong tổng số{' '}
                    <span className="font-medium">{totalItems}</span> người dùng
                    {totalPages > 1 && (
                        <span className="text-gray-500"> - Trang {currentPage}/{totalPages}</span>
                    )}
                </div>
                <div className="flex gap-1 items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default UserPagination;
