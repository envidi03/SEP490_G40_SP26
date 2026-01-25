import React, { useState, useEffect } from 'react';
import { mockRooms, mockRoomUsers, mockUsers, mockAccounts } from '../../../utils/mockData';

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
    useEffect(() => {
        // Load rooms and fill missing new fields with defaults for mock data
        const enrichedRooms = mockRooms.map(room => ({
            ...room,
            room_type: room.room_type || 'Phòng khám tiêu chuẩn',
            equipment: room.equipment || 'Ghế nha khoa, Đèn LED, Máy X-Quang tại chỗ',
            description: room.description || ''
        }));
        setRooms(enrichedRooms);

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
    }, []);

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

    // ... (rest of handlers)

    // ...

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
    const handleSaveRoom = () => {
        if (!roomForm.room_number.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập số phòng!'
            });
            return;
        }

        if (isEditMode) {
            // Update room
            setRooms(prev => prev.map(r =>
                r.id === selectedRoom.id
                    ? { ...r, ...roomForm }
                    : r
            ));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật phòng khám thành công!'
            });
        } else {
            // Add new room
            const newRoom = {
                id: `room_${String(rooms.length + 1).padStart(3, '0')} `,
                ...roomForm
            };
            setRooms(prev => [...prev, newRoom]);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Thêm phòng khám mới thành công!'
            });
        }

        setShowRoomModal(false);
        setSelectedRoom(null);
    };


    /**
     * Handler: Delete room
     */
    const handleDeleteRoom = (roomId) => {
        setConfirmation({
            show: true,
            title: 'Xóa phòng khám',
            message: 'Bạn có chắc chắn muốn xóa phòng này? Hành động này sẽ xóa cả lịch sử phân công và không thể hoàn tác.',
            onConfirm: () => {
                setRooms(prev => prev.filter(r => r.id !== roomId));
                // Also remove assignments
                setRoomAssignments(prev => prev.filter(a => a.room_id !== roomId));
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Đã xóa phòng khám!'
                });
                setConfirmation(prev => ({ ...prev, show: false }));
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
                    {rooms.map(room => (
                        <RoomCard
                            key={room.id}
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
