import React from 'react';
import PropTypes from 'prop-types';

/**
 * AppointmentStats - Component hiển thị thống kê tổng quan lịch khám
 * Hiển thị 4 cards: Tổng số, Chờ xác nhận, Đã xác nhận, Hoàn thành
 * 
 * @param {Array} appointments - Mảng tất cả appointments để tính toán
 */
const AppointmentStats = ({ appointments }) => {
    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'Pending').length,
        confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
    };

    return (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* Total */}
                <div>
                    <div className="text-2xl font-bold text-gray-900">
                        {stats.total}
                    </div>
                    <div className="text-sm text-gray-600">Tổng lịch khám</div>
                </div>

                {/* Pending */}
                <div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {stats.pending}
                    </div>
                    <div className="text-sm text-gray-600">Chờ xác nhận</div>
                </div>

                {/* Confirmed */}
                <div>
                    <div className="text-2xl font-bold text-green-600">
                        {stats.confirmed}
                    </div>
                    <div className="text-sm text-gray-600">Đã xác nhận</div>
                </div>

                {/* Completed */}
                <div>
                    <div className="text-2xl font-bold text-blue-600">
                        {stats.completed}
                    </div>
                    <div className="text-sm text-gray-600">Hoàn thành</div>
                </div>
            </div>
        </div>
    );
};

AppointmentStats.propTypes = {
    appointments: PropTypes.arrayOf(
        PropTypes.shape({
            status: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default AppointmentStats;
