import React from 'react';
import Card from '../../../../components/ui/Card';

const UserPagination = ({ currentCount, totalCount }) => {
    return (
        <Card className="mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                    Hiển thị <span className="font-medium">1-{currentCount}</span> trong tổng số{' '}
                    <span className="font-medium">{totalCount}</span> người dùng
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                        Trước
                    </button>
                    <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                        Sau
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default UserPagination;
