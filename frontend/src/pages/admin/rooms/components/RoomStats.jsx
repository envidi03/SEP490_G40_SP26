import React from 'react';
import { DoorOpen, CheckCircle, Wrench, UserCog } from 'lucide-react';

const RoomStats = ({ rooms, roomAssignments }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <DoorOpen className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tổng số phòng</p>
                        <p className="text-3xl font-bold text-blue-600">{rooms.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                        <p className="text-3xl font-bold text-green-600">
                            {rooms.filter(r => r.status === 'ACTIVE').length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Wrench className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Đang bảo trì</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {rooms.filter(r => r.status === 'MAINTENANCE').length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <UserCog className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Phân công</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {roomAssignments.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomStats;
