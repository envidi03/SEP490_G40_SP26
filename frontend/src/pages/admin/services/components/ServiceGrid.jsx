import React from 'react';
import { ClipboardList } from 'lucide-react';
import ServiceCard from './ServiceCard';
import ServicePagination from './ServicePagination';

const ServiceGrid = ({
    services,
    pagination,
    onPageChange,
    searchTerm,
    onViewDetails,
    onEdit,
    onDelete,
    onUpdatePrice,
    formatCurrency,
    getCategoryColor
}) => {
    if (services.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                <ClipboardList className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy dịch vụ
                </h3>
                <p className="text-gray-600">
                    {searchTerm
                        ? 'Không có dịch vụ nào phù hợp với từ khóa tìm kiếm'
                        : 'Chưa có dịch vụ nào trong hệ thống'}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <ServiceCard
                        key={service._id}
                        service={service}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdatePrice={onUpdatePrice}
                        formatCurrency={formatCurrency}
                        getCategoryColor={getCategoryColor}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pagination && (
                <ServicePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.size}
                    onPageChange={onPageChange}
                />
            )}
        </>
    );
};

export default ServiceGrid;
