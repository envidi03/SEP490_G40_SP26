import React, { useState, useEffect } from 'react';
import roomService from '../../../services/roomService';

import Toast from '../../../components/ui/Toast';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import {
    DoorOpen,
    Plus,
    CheckCircle,
    AlertCircle,
    XCircle,
    Wrench
} from 'lucide-react';

import RoomStats from './components/RoomStats';
import RoomCard from './components/RoomCard';

import RoomFormModal from './modals/RoomFormModal';
import RoomDetailModal from './modals/RoomDetailModal';

/**
 * RoomList - Trang quản lý phòng khám
 *
 * Chức năng:
 * - Xem danh sách phòng khám
 * - Thêm/sửa phòng
 * - Quản lý trạng thái phòng
 *
 * @component
 */
const RoomList = () => {
    // ========== STATE MANAGEMENT ==========
    const [rooms, setRooms] = useState([]);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1
    });

    // Confirmation State
    const [confirmation, setConfirmation] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Modals
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDetailRoom, setSelectedDetailRoom] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form data
    const [roomForm, setRoomForm] = useState({
        room_number: '',
        status: 'ACTIVE',
        clinic_id: 'clinic_001',
        room_type: 'Phòng khám tiêu chuẩn',
        equipment: '',
        description: ''
    });

    // ========== HELPER CONSTANTS ==========
    const AVAILABLE_EQUIPMENT = [
        'Ghế nha khoa',
        'Máy X-Quang',
        'Đèn trám răng',
        'Camera nội soi',
        'Máy cạo vôi răng',
        'Máy nội nha',
        'Máy hút phẫu thuật',
        'Màn hình hiển thị TV',
        'Máy tiệt trùng',
        'Tủ dụng cụ y tế'
    ];

    // ========== DATA FETCHING ==========
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await roomService.getRooms({
                page: pagination.page,
                limit: pagination.limit
            });

            if (response.data) {
                const roomData = response.data.data || response.data;
                setRooms(roomData);

                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        ...response.data.pagination
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không thể tải danh sách phòng!'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [pagination.page]);

    // ========== HELPER FUNCTIONS ==========
    const getStatusColor = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
            'MAINTENANCE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'INACTIVE': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusText = (status) => {
        const texts = {
            'ACTIVE': 'Hoạt động',
            'MAINTENANCE': 'Bảo trì',
            'INACTIVE': 'Ngừng hoạt động'
        };
        return texts[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            'ACTIVE': CheckCircle,
            'MAINTENANCE': Wrench,
            'INACTIVE': XCircle
        };
        return icons[status] || AlertCircle;
    };

    const handleToggleEquipment = (item) => {
        const currentEquipments = roomForm.equipment
            ? roomForm.equipment.split(', ').filter(Boolean)
            : [];

        const newEquipments = currentEquipments.includes(item)
            ? currentEquipments.filter(e => e !== item)
            : [...currentEquipments, item];

        setRoomForm({ ...roomForm, equipment: newEquipments.join(', ') });
    };

    // ========== HANDLERS ==========
    const handleAddRoom = () => {
        setIsEditMode(false);
        setRoomForm({
            room_number: '',
            status: 'ACTIVE',
            clinic_id: 'clinic_001',
            room_type: 'Phòng khám tiêu chuẩn',
            equipment: 'Ghế nha khoa, Đèn trám răng',
            description: ''
        });
        setShowRoomModal(true);
    };

    const handleEditRoom = (room) => {
        setIsEditMode(true);
        setSelectedRoom(room);
        setRoomForm({
            room_number: room.room_number,
            status: room.status,
            clinic_id: room.clinic_id,
            room_type: room.room_type || 'Phòng khám tiêu chuẩn',
            equipment: room.equipment || '',
            description: room.description || ''
        });
        setShowRoomModal(true);
    };

    const handleSaveRoom = async () => {
        if (!roomForm.room_number.trim()) {
            setToast({ show: true, type: 'error', message: '❌ Vui lòng nhập số phòng!' });
            return;
        }

        try {
            setLoading(true);

            let clinicIdToUse = roomForm.clinic_id;
            if (!clinicIdToUse || clinicIdToUse === 'clinic_001') {
                if (rooms.length > 0 && rooms[0].clinic_id) {
                    clinicIdToUse = rooms[0].clinic_id;
                }
            }

            const payload = { ...roomForm, clinic_id: clinicIdToUse };
            const roomId = selectedRoom?.id || selectedRoom?._id;

            if (isEditMode) {
                await roomService.updateRoom(roomId, payload);
                if (selectedRoom.status !== payload.status) {
                    await roomService.updateRoomStatus(roomId, payload.status);
                }
                setToast({ show: true, type: 'success', message: '✅ Cập nhật phòng khám thành công!' });
            } else {
                await roomService.createRoom(payload);
                setToast({ show: true, type: 'success', message: '✅ Thêm phòng khám mới thành công!' });
            }

            fetchRooms();
            setShowRoomModal(false);
            setSelectedRoom(null);
        } catch (error) {
            console.error('Save room error:', error);
            const errorMsg = error.message || error.data?.message || 'Có lỗi xảy ra!';
            setToast({ show: true, type: 'error', message: `❌ ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = (roomId) => {
        setConfirmation({
            show: true,
            title: 'Xóa phòng khám',
            message: 'Bạn có chắc chắn muốn xóa phòng khám này không? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await roomService.updateRoomStatus(roomId, 'INACTIVE');
                    setToast({ show: true, type: 'success', message: '✅ Đã xóa phòng khám thành công!' });
                    fetchRooms();
                } catch (error) {
                    console.error('Delete room error:', error);
                    setToast({ show: true, type: 'error', message: '❌ Không thể xóa phòng khám!' });
                } finally {
                    setLoading(false);
                    setConfirmation(prev => ({ ...prev, show: false }));
                }
            }
        });
    };

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <DoorOpen className="text-blue-600" size={40} />
                            Quản lý Phòng khám
                        </h1>
                        <p className="text-gray-600 text-lg">Danh sách phòng khám</p>
                    </div>

                    {/* Add Room Button */}
                    <button
                        onClick={handleAddRoom}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm phòng</span>
                    </button>
                </div>

                {/* Statistics */}
                <RoomStats rooms={rooms} />

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room, index) => (
                        <RoomCard
                            key={room._id || room.id || index}
                            room={room}
                            getStatusIcon={getStatusIcon}
                            getStatusColor={getStatusColor}
                            getStatusText={getStatusText}
                            onViewDetail={(r) => {
                                setSelectedDetailRoom(r);
                                setShowDetailModal(true);
                            }}
                            onEdit={handleEditRoom}
                            onDelete={handleDeleteRoom}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {rooms.length === 0 && !loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <DoorOpen className="text-gray-300 mx-auto mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có phòng khám nào</h3>
                        <p className="text-gray-600 mb-6">Thêm phòng khám đầu tiên để bắt đầu quản lý</p>
                        <button
                            onClick={handleAddRoom}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={20} />
                            <span>Thêm phòng đầu tiên</span>
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {rooms.length > 0 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className={`px-4 py-2 rounded-lg border ${pagination.page === 1
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Trước
                        </button>
                        <span className="text-gray-600 px-4">
                            Trang {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className={`px-4 py-2 rounded-lg border ${pagination.page === pagination.totalPages
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Room Modal (Add/Edit) */}
            <RoomFormModal
                show={showRoomModal}
                isEditMode={isEditMode}
                roomForm={roomForm}
                setRoomForm={setRoomForm}
                onClose={() => setShowRoomModal(false)}
                onSave={handleSaveRoom}
                availableEquipment={AVAILABLE_EQUIPMENT}
                handleToggleEquipment={handleToggleEquipment}
            />

            {/* Room Detail Modal */}
            <RoomDetailModal
                show={showDetailModal}
                room={selectedDetailRoom}
                onClose={() => setShowDetailModal(false)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmation.show}
                title={confirmation.title}
                message={confirmation.message}
                onClose={() => setConfirmation({ ...confirmation, show: false })}
                onConfirm={confirmation.onConfirm}
            />

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default RoomList;
