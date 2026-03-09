import { useState } from 'react';
import { Pill, Search, Plus, Eye, Edit, CheckCircle, Clock, Printer, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PrescriptionModal from './modals/PrescriptionModal';

// Mock prescriptions data
const mockPrescriptions = [
    {
        id: 'rx_001',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0901234567',
        doctorName: 'BS. Nguyễn Văn Anh',
        date: '2026-01-17',
        diagnosis: 'Sâu răng hàm số 6',
        status: 'dispensed',
        items: [
            { name: 'Amoxicillin 500mg', quantity: 15, dosage: '1 viên x 3 lần/ngày x 5 ngày', unit: 'viên' },
            { name: 'Paracetamol 500mg', quantity: 6, dosage: '1 viên x 2 lần/ngày khi đau', unit: 'viên' },
            { name: 'Nước súc miệng Chlorhexidine', quantity: 1, dosage: 'Súc miệng 2 lần/ngày', unit: 'chai' }
        ],
        notes: 'Uống sau ăn. Tái khám sau 5 ngày.'
    },
    {
        id: 'rx_002',
        patientName: 'Trần Thị B',
        patientPhone: '0912345678',
        doctorName: 'BS. Trần Thị Bình',
        date: '2026-01-17',
        diagnosis: 'Nhổ răng khôn hàm dưới phải',
        status: 'pending',
        items: [
            { name: 'Amoxicillin 500mg', quantity: 21, dosage: '1 viên x 3 lần/ngày x 7 ngày', unit: 'viên' },
            { name: 'Ibuprofen 400mg', quantity: 10, dosage: '1 viên khi đau, tối đa 3 lần/ngày', unit: 'viên' },
            { name: 'Metronidazole 250mg', quantity: 14, dosage: '1 viên x 2 lần/ngày x 7 ngày', unit: 'viên' }
        ],
        notes: 'Kiêng đồ cứng, nóng. Chườm đá 24h đầu.'
    },
    {
        id: 'rx_003',
        patientName: 'Lê Văn C',
        patientPhone: '0923456789',
        doctorName: 'BS. Nguyễn Văn Anh',
        date: '2026-01-16',
        diagnosis: 'Viêm nướu nhẹ',
        status: 'dispensed',
        items: [
            { name: 'Nước súc miệng Listerine', quantity: 1, dosage: 'Súc miệng 2 lần/ngày sau bữa ăn', unit: 'chai' },
            { name: 'Gel bôi nướu Metrogyl Denta', quantity: 1, dosage: 'Bôi vùng nướu viêm 2 lần/ngày', unit: 'tuýp' }
        ],
        notes: 'Hướng dẫn vệ sinh răng miệng đúng cách.'
    },
    {
        id: 'rx_004',
        patientName: 'Phạm Thị D',
        patientPhone: '0934567890',
        doctorName: 'BS. Lê Hoàng Cường',
        date: '2026-01-17',
        diagnosis: 'Tẩy trắng răng laser',
        status: 'pending',
        items: [
            { name: 'Kem chống ê buốt Sensodyne', quantity: 1, dosage: 'Đánh răng 2 lần/ngày trong 2 tuần', unit: 'tuýp' },
            { name: 'Gel fluoride dạng khay', quantity: 2, dosage: 'Đeo khay 15 phút/ngày trong 1 tuần', unit: 'tuýp' }
        ],
        notes: 'Tránh thực phẩm có màu trong 48h sau tẩy.'
    },
    {
        id: 'rx_005',
        patientName: 'Hoàng Văn E',
        patientPhone: '0945678901',
        doctorName: 'BS. Nguyễn Văn Anh',
        date: '2026-01-15',
        diagnosis: 'Trám răng composite',
        status: 'dispensed',
        items: [
            { name: 'Paracetamol 500mg', quantity: 4, dosage: '1 viên khi đau, cách 6 tiếng', unit: 'viên' }
        ],
        notes: 'Không cắn đồ cứng trong 24h.'
    }
];

const AssistantPrescriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'

    const filteredPrescriptions = mockPrescriptions.filter(rx => {
        const matchesSearch = rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rx.patientPhone.includes(searchTerm) ||
            rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || rx.status === filterStatus;
        const matchesDoctor = filterDoctor === 'all' || rx.doctorName === filterDoctor;
        const matchesDate = !filterDate || rx.date === filterDate;
        return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'dispensed':
                return { label: 'Đã cấp thuốc', variant: 'success', icon: CheckCircle };
            case 'pending':
                return { label: 'Chưa cấp thuốc', variant: 'warning', icon: Clock };
            default:
                return { label: status, variant: 'default', icon: Clock };
        }
    };

    const handleCreateClick = () => {
        setSelectedPrescription(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleViewClick = (rx) => {
        setSelectedPrescription(rx);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEditClick = (rx) => {
        setSelectedPrescription(rx);
        setModalMode('edit');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPrescription(null);
    };

    const handleSave = (data) => {
        // TODO: Call API to create/update prescription
        console.log('Save prescription:', data);
        closeModal();
    };

    // Get unique doctors for filter
    const doctors = ['all', ...new Set(mockPrescriptions.map(rx => rx.doctorName))];

    // Stats
    const stats = {
        total: mockPrescriptions.length,
        dispensed: mockPrescriptions.filter(rx => rx.status === 'dispensed').length,
        pending: mockPrescriptions.filter(rx => rx.status === 'pending').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h1>
                    <p className="text-gray-600 mt-1">Kê đơn và cấp phát thuốc cho bệnh nhân</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 font-medium"
                >
                    <Plus size={20} />
                    Kê đơn mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng đơn thuốc</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Pill size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã cấp thuốc</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.dispensed}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chưa cấp thuốc</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <Clock size={24} className="text-amber-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên, SĐT, chẩn đoán..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kê đơn</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="dispensed">Đã cấp thuốc</option>
                            <option value="pending">Chưa cấp thuốc</option>
                        </select>
                    </div>

                    {/* Doctor Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bác sĩ</label>
                        <select
                            value={filterDoctor}
                            onChange={(e) => setFilterDoctor(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            {doctors.filter(d => d !== 'all').map(doctor => (
                                <option key={doctor} value={doctor}>{doctor}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Prescriptions Table */}
            <Card>
                {filteredPrescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chẩn đoán</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số thuốc</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPrescriptions.map((rx) => {
                                    const statusInfo = getStatusInfo(rx.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={rx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{rx.patientName}</p>
                                                    <p className="text-xs text-gray-500">{rx.patientPhone}</p>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm text-gray-700 max-w-[200px] truncate">{rx.diagnosis}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm text-gray-600">{rx.doctorName}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm text-gray-600">{rx.date}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                                    {rx.items.length}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleViewClick(rx)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(rx)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="In đơn thuốc"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Không tìm thấy đơn thuốc nào</p>
                    </div>
                )}
            </Card>

            {/* Modal */}
            <PrescriptionModal
                prescription={selectedPrescription}
                isOpen={showModal}
                mode={modalMode}
                onClose={closeModal}
                onSave={handleSave}
            />
        </div>
    );
};

export default AssistantPrescriptions;
