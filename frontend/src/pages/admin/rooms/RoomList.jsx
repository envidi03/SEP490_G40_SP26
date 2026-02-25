import React, { useState, useEffect } from 'react';
import { mockRooms, mockRoomUsers, mockUsers, mockAccounts } from '../../../utils/mockData';
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
import AssignDoctorModal from './modals/AssignDoctorModal';

/**
 * RoomList - Trang quản lý phòng khám
 * 
 * Chức năng:
 * - Xem danh sách phòng khám
 * - Thêm/sửa/xóa phòng
 * - Gán bác sĩ vào phòng
 * - Gán trợ lý vào phòng
 * - Quản lý trạng thái phòng
 * 
 * @component
 */
const RoomList = () => {
    // ========== STATE MANAGEMENT ==========
    const [rooms, setRooms] = useState([]);
    const [roomAssignments, setRoomAssignments] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [assistantsList, setAssistantsList] = useState([]);
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
    const [showAssignModal, setShowAssignModal] = useState(false);
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

    const [assignForm, setAssignForm] = useState({
        doctor_id: '',
        working_start_Date: new Date().toISOString().split('T')[0]
    });

    // ========== EFFECTS ==========
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await roomService.getRooms({
                page: pagination.page,
                limit: pagination.limit
            });

            if (response.data) {
                // Assuming response structure matches: { data: [], pagination: {} }
                // Need to adapt based on actual API response structure if simplified
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

        // Mock data for assignments/doctors until those APIs are ready or if we still mock them
        setRoomAssignments(mockRoomUsers);

        // Get doctors (role_002)
        const doctors = mockUsers.filter(user => {
            const account = mockAccounts.find(a => a.id === user.account_id);
            return account && account.role_id === 'role_002'; // Doctor role
        });
        setDoctorsList(doctors);

        // Get assistants (role_006)
        const assistants = mockUsers.filter(user => {
            const account = mockAccounts.find(a => a.id === user.account_id);
            return account && account.role_id === 'role_006'; // Assistant role
        });
        setAssistantsList(assistants);
    }, [pagination.page]); // Refetch when page changes

    // ========== HELPER FUNCTIONS ==========

    /**
     * Get status color class
     */
    const getStatusColor = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
            'MAINTENANCE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'INACTIVE': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    /**
     * Get status text in Vietnamese
     */
    const getStatusText = (status) => {
        const texts = {
            'ACTIVE': 'Hoạt động',
            'MAINTENANCE': 'Bảo trì',
            'INACTIVE': 'Ngừng hoạt động'
        };
        return texts[status] || status;
    };

    /**
     * Get status icon
     */
    const getStatusIcon = (status) => {
        const icons = {
            'ACTIVE': CheckCircle,
            'MAINTENANCE': Wrench,
            'INACTIVE': XCircle
        };
        return icons[status] || AlertCircle;
    };

    /**
     * Get assigned doctors for a room
     */
    const getAssignedDoctors = (roomId) => {
        const assignments = roomAssignments.filter(a => a.room_id === roomId);
        return assignments.map(a => {
            const doctor = doctorsList.find(d => d.id === a.doctor_id);
            return doctor ? { ...doctor, assignmentDate: a.working_start_Date } : null;
        }).filter(Boolean);
    };

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

    /**
     * Helper: Toggle equipment in form
     */
    const handleToggleEquipment = (item) => {
        const currentEquipments = roomForm.equipment
            ? roomForm.equipment.split(', ').filter(Boolean)
            : [];

        let newEquipments;
        if (currentEquipments.includes(item)) {
            newEquipments = currentEquipments.filter(e => e !== item);
        } else {
            newEquipments = [...currentEquipments, item];
        }

        setRoomForm({ ...roomForm, equipment: newEquipments.join(', ') });
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Open add room modal
     */
    const handleAddRoom = () => {
        setIsEditMode(false);
        setRoomForm({
            room_number: '',
            status: 'ACTIVE',
            clinic_id: 'clinic_001',
            room_type: 'Phòng khám tiêu chuẩn',
            equipment: 'Ghế nha khoa, Đèn trám răng', // Default for convenience
            description: ''
        });
        setShowRoomModal(true);
    };

    /**
     * Handler: Open edit room modal
     */
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


    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            Trang thiết bị (Chọn các thiết bị có sẵn)
        </label>
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto custom-scrollbar">
            {AVAILABLE_EQUIPMENT.map(item => (
                <label key={item} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                    <input
                        type="checkbox"
                        checked={roomForm.equipment ? roomForm.equipment.includes(item) : false}
                        onChange={() => handleToggleEquipment(item)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-all"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                </label>
            ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
            Đã chọn: {roomForm.equipment || 'Chưa chọn thiết bị nào'}
        </p>
    </div>

    /**
     * Handler: Save room (add/edit)
     */
    /**
     * Handler: Save room (add/edit)
     */
    const handleSaveRoom = async () => {
        if (!roomForm.room_number.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập số phòng!'
            });
            return;
        }

        try {
            setLoading(true);

            // Try to find a valid clinic_id from existing rooms if not set
            let clinicIdToUse = roomForm.clinic_id;
            if (!clinicIdToUse || clinicIdToUse === 'clinic_001') {
                if (rooms.length > 0 && rooms[0].clinic_id) {
                    clinicIdToUse = rooms[0].clinic_id;
                }
            }

            const payload = {
                ...roomForm,
                clinic_id: clinicIdToUse
            };

            const roomId = selectedRoom?.id || selectedRoom?._id;

            if (isEditMode) {
                // Update room details (backend ignores status)
                await roomService.updateRoom(roomId, payload);

                // Check if status changed, if so, call updateStatus separately
                if (selectedRoom.status !== payload.status) {
                    await roomService.updateRoomStatus(roomId, payload.status);
                }

                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Cập nhật phòng khám thành công!'
                });
            } else {
                // Add new room
                await roomService.createRoom(payload);
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Thêm phòng khám mới thành công!'
                });
            }

            // Refresh list
            fetchRooms();
            setShowRoomModal(false);
            setSelectedRoom(null);
        } catch (error) {
            console.error('Save room error:', error);
            const errorMsg = error.message || error.data?.message || 'Có lỗi xảy ra!';
            setToast({
                show: true,
                type: 'error',
                message: `❌ ${errorMsg}`
            });
        } finally {
            setLoading(false);
        }
    };


    /**
     * Handler: Delete room
     */
    /**
     * Handler: Delete room (Soft delete - change status to INACTIVE)
     */
    const handleDeleteRoom = (roomId) => {
        setConfirmation({
            show: true,
            title: 'Xóa phòng khám',
            message: 'Bạn có chắc chắn muốn xóa phòng khám này không? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    // Soft delete by setting status to INACTIVE
                    await roomService.updateRoomStatus(roomId, 'INACTIVE');

                    setToast({
                        show: true,
                        type: 'success',
                        message: '✅ Đã xóa phòng khám thành công!'
                    });

                    // Refresh list (will hide the INACTIVE room)
                    fetchRooms();
                } catch (error) {
                    console.error('Delete room error:', error);
                    setToast({
                        show: true,
                        type: 'error',
                        message: '❌ Không thể xóa phòng khám!'
                    });
                } finally {
                    setLoading(false);
                    setConfirmation(prev => ({ ...prev, show: false }));
                }
            }
        });
    };



    /**
     * Handler: Open assign doctor modal
     */
    const handleAssignDoctor = (room) => {
        setSelectedRoom(room);
        setAssignForm({
            doctor_id: '',
            working_start_Date: new Date().toISOString().split('T')[0]
        });
        setShowAssignModal(true);
    };

    /**
     * Handler: Save doctor assignment
     */
    const handleSaveAssignment = () => {
        if (!assignForm.doctor_id) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng chọn bác sĩ!'
            });
            return;
        }

        const newAssignment = {
            id: `ru_${String(roomAssignments.length + 1).padStart(3, '0')} `,
            room_id: selectedRoom.id,
            doctor_id: assignForm.doctor_id,
            working_start_Date: assignForm.working_start_Date
        };

        setRoomAssignments(prev => [...prev, newAssignment]);
        setShowAssignModal(false);
        setSelectedRoom(null);
        setToast({
            show: true,
            type: 'success',
            message: '✅ Gán bác sĩ vào phòng thành công!'
        });
    };


    /**
     * Handler: Remove doctor assignment
     */
    const handleRemoveAssignment = (roomId, doctorId) => {
        setConfirmation({
            show: true,
            title: 'Hủy phân công bác sĩ',
            message: 'Bạn có chắc chắn muốn hủy phân công bác sĩ này khỏi phòng khám không?',
            onConfirm: () => {
                setRoomAssignments(prev => prev.filter(a =>
                    !(a.room_id === roomId && a.doctor_id === doctorId)
                ));
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Đã xóa phân công bác sĩ!'
                });
                setConfirmation(prev => ({ ...prev, show: false }));
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
                        <p className="text-gray-600 text-lg">
                            Danh sách phòng khám - Gán bác sĩ và trợ lý
                        </p>
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
                <RoomStats rooms={rooms} roomAssignments={roomAssignments} />

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room, index) => (
                        <RoomCard
                            key={room.id || index}
                            room={room}
                            getStatusIcon={getStatusIcon}
                            getStatusColor={getStatusColor}
                            getStatusText={getStatusText}
                            getAssignedDoctors={getAssignedDoctors}
                            onAssignDoctor={handleAssignDoctor}
                            onRemoveAssignment={handleRemoveAssignment}
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
                {rooms.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <DoorOpen className="text-gray-300 mx-auto mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Chưa có phòng khám nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Thêm phòng khám đầu tiên để bắt đầu quản lý
                        </p>
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

            {/* Assign Doctor Modal */}
            <AssignDoctorModal
                show={showAssignModal}
                room={selectedRoom}
                assignForm={assignForm}
                setAssignForm={setAssignForm}
                doctorsList={doctorsList}
                onClose={() => setShowAssignModal(false)}
                onSave={handleSaveAssignment}
            />

            {/* Room Detail Modal */}
            <RoomDetailModal
                show={showDetailModal}
                room={selectedDetailRoom}
                onClose={() => setShowDetailModal(false)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getAssignedDoctors={getAssignedDoctors}
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
