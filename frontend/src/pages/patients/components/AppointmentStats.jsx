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
        scheduled: appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CHECKED_IN').length,
        inProgress: appointments.filter(a => a.status === 'IN_CONSULTATION').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
    };

    return (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* Total */}
                <div>
                    <div className="text-2xl font-bold text-gray-900">
                        {stats.total}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số</div>
                </div>

                {/* Scheduled & Checked in */}
                <div>
                    <div className="text-2xl font-bold text-blue-600">
                        {stats.scheduled}
                    </div>
                    <div className="text-sm text-gray-600">Đã lên lịch / Chờ khám</div>
                </div>

                {/* In Progress */}
                <div>
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.inProgress}
                    </div>
                    <div className="text-sm text-gray-600">Đang khám</div>
                </div>

                {/* Completed */}
                <div>
                    <div className="text-2xl font-bold text-green-600">
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
