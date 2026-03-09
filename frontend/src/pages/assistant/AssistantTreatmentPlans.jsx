import { useState } from 'react';
import { ClipboardList, Search, Plus, Eye, Edit, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TreatmentPlanModal from './modals/TreatmentPlanModal';

// Mock treatment plans data
const mockTreatmentPlans = [
    {
        id: 'tp_001',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0901234567',
        doctorName: 'BS. Nguyễn Văn Anh',
        planName: 'Niềng răng chỉnh nha',
        diagnosis: 'Răng lệch hàm trên, khớp cắn sâu',
        startDate: '2026-01-10',
        estimatedEndDate: '2028-01-10',
        totalCost: 45000000,
        progress: 15,
        status: 'in_progress',
        phases: [
            { name: 'Khám tổng quát & chụp phim', status: 'completed', startDate: '2026-01-10', endDate: '2026-01-15' },
            { name: 'Gắn mắc cài', status: 'in_progress', startDate: '2026-01-20', endDate: '2026-02-01' },
            { name: 'Điều chỉnh định kỳ (6 tháng)', status: 'pending', startDate: '2026-02-01', endDate: '2026-08-01' },
            { name: 'Tháo mắc cài & đeo hàm duy trì', status: 'pending', startDate: '2028-01-01', endDate: '2028-01-10' }
        ],
        notes: 'Bệnh nhân cần tái khám mỗi tháng một lần'
    },
    {
        id: 'tp_002',
        patientName: 'Trần Thị B',
        patientPhone: '0912345678',
        doctorName: 'BS. Trần Thị Bình',
        planName: 'Trồng răng Implant',
        diagnosis: 'Mất răng hàm dưới số 6 bên trái',
        startDate: '2025-11-01',
        estimatedEndDate: '2026-05-01',
        totalCost: 25000000,
        progress: 60,
        status: 'in_progress',
        phases: [
            { name: 'Chụp CT & lên kế hoạch phẫu thuật', status: 'completed', startDate: '2025-11-01', endDate: '2025-11-10' },
            { name: 'Cấy trụ Implant', status: 'completed', startDate: '2025-11-15', endDate: '2025-11-15' },
            { name: 'Chờ tích hợp xương (3-6 tháng)', status: 'in_progress', startDate: '2025-11-16', endDate: '2026-04-01' },
            { name: 'Lắp mão răng sứ', status: 'pending', startDate: '2026-04-15', endDate: '2026-05-01' }
        ],
        notes: 'Tiến trình tích hợp xương đang tốt'
    },
    {
        id: 'tp_003',
        patientName: 'Lê Văn C',
        patientPhone: '0923456789',
        doctorName: 'BS. Nguyễn Văn Anh',
        planName: 'Điều trị viêm nha chu',
        diagnosis: 'Viêm nha chu mãn tính giai đoạn 2',
        startDate: '2026-01-05',
        estimatedEndDate: '2026-04-05',
        totalCost: 8000000,
        progress: 100,
        status: 'completed',
        phases: [
            { name: 'Cạo vôi & xử lý túi nha chu', status: 'completed', startDate: '2026-01-05', endDate: '2026-01-05' },
            { name: 'Phẫu thuật nạo túi nha chu', status: 'completed', startDate: '2026-01-20', endDate: '2026-01-20' },
            { name: 'Tái khám & duy trì', status: 'completed', startDate: '2026-02-20', endDate: '2026-04-05' }
        ],
        notes: 'Đã hoàn thành điều trị, nướu hồi phục tốt'
    },
    {
        id: 'tp_004',
        patientName: 'Phạm Thị D',
        patientPhone: '0934567890',
        doctorName: 'BS. Lê Hoàng Cường',
        planName: 'Tẩy trắng & thẩm mỹ răng',
        diagnosis: 'Răng ố vàng, muốn cải thiện thẩm mỹ',
        startDate: '2026-02-01',
        estimatedEndDate: '2026-03-01',
        totalCost: 15000000,
        progress: 0,
        status: 'pending',
        phases: [
            { name: 'Khám & tư vấn phương án', status: 'pending', startDate: '2026-02-01', endDate: '2026-02-01' },
            { name: 'Tẩy trắng tại phòng khám', status: 'pending', startDate: '2026-02-10', endDate: '2026-02-10' },
            { name: 'Dán sứ Veneer (6 răng cửa)', status: 'pending', startDate: '2026-02-20', endDate: '2026-03-01' }
        ],
        notes: 'Bệnh nhân yêu cầu màu trắng A1'
    }
];

const AssistantTreatmentPlans = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'

    const filteredPlans = mockTreatmentPlans.filter(plan => {
        const matchesSearch = plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.patientPhone.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
        const matchesDoctor = filterDoctor === 'all' || plan.doctorName === filterDoctor;
        return matchesSearch && matchesStatus && matchesDoctor;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'in_progress':
                return { label: 'Đang tiến hành', variant: 'warning', icon: Clock };
            case 'completed':
                return { label: 'Hoàn thành', variant: 'success', icon: CheckCircle };
            case 'pending':
                return { label: 'Chờ duyệt', variant: 'default', icon: AlertCircle };
            default:
                return { label: status, variant: 'default', icon: Clock };
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCreateClick = () => {
        setSelectedPlan(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleViewClick = (plan) => {
        setSelectedPlan(plan);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEditClick = (plan) => {
        setSelectedPlan(plan);
        setModalMode('edit');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPlan(null);
    };

    const handleSave = (data) => {
        // TODO: Call API to create/update treatment plan
        console.log('Save treatment plan:', data);
        closeModal();
    };

    // Get unique doctors for filter
    const doctors = ['all', ...new Set(mockTreatmentPlans.map(p => p.doctorName))];

    // Stats
    const stats = {
        total: mockTreatmentPlans.length,
        inProgress: mockTreatmentPlans.filter(p => p.status === 'in_progress').length,
        completed: mockTreatmentPlans.filter(p => p.status === 'completed').length,
        pending: mockTreatmentPlans.filter(p => p.status === 'pending').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kế Hoạch Điều Trị</h1>
                    <p className="text-gray-600 mt-1">Quản lý kế hoạch điều trị dài hạn cho bệnh nhân</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 font-medium"
                >
                    <Plus size={20} />
                    Tạo kế hoạch mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng kế hoạch</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <ClipboardList size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đang tiến hành</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.inProgress}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <Clock size={24} className="text-amber-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hoàn thành</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chờ duyệt</p>
                            <p className="text-3xl font-bold text-gray-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-full">
                            <AlertCircle size={24} className="text-gray-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân, kế hoạch, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
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
                            <option value="in_progress">Đang tiến hành</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="pending">Chờ duyệt</option>
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

            {/* Treatment Plans List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPlans.length > 0 ? (
                    filteredPlans.map((plan) => {
                        const statusInfo = getStatusInfo(plan.status);
                        const StatusIcon = statusInfo.icon;
                        const completedPhases = plan.phases.filter(p => p.status === 'completed').length;

                        return (
                            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Plan Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold text-gray-900">{plan.planName}</h3>
                                            <Badge variant={statusInfo.variant}>
                                                <StatusIcon size={14} className="inline mr-1" />
                                                {statusInfo.label}
                                            </Badge>
                                        </div>

                                        {/* Patient & Doctor Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 mb-4">
                                            <p><span className="font-medium">Bệnh nhân:</span> {plan.patientName}</p>
                                            <p><span className="font-medium">Bác sĩ:</span> {plan.doctorName}</p>
                                            <p><span className="font-medium">Chẩn đoán:</span> {plan.diagnosis}</p>
                                            <p><span className="font-medium">Chi phí:</span> {formatCurrency(plan.totalCost)}</p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between text-sm mb-1.5">
                                                <span className="text-gray-500 font-medium">
                                                    Tiến độ: {completedPhases}/{plan.phases.length} giai đoạn
                                                </span>
                                                <span className="font-bold text-blue-600">{plan.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${plan.progress === 100
                                                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                                                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                        }`}
                                                    style={{ width: `${plan.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Phases Mini Timeline */}
                                        <div className="flex gap-1.5 mt-3">
                                            {plan.phases.map((phase, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 h-1.5 rounded-full ${phase.status === 'completed' ? 'bg-green-400' :
                                                            phase.status === 'in_progress' ? 'bg-amber-400 animate-pulse' :
                                                                'bg-gray-200'
                                                        }`}
                                                    title={`${phase.name} - ${phase.status === 'completed' ? 'Hoàn thành' : phase.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4 shrink-0">
                                        <button
                                            onClick={() => handleViewClick(plan)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        {plan.status !== 'completed' && (
                                            <button
                                                onClick={() => handleEditClick(plan)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Không tìm thấy kế hoạch điều trị nào</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal */}
            <TreatmentPlanModal
                plan={selectedPlan}
                isOpen={showModal}
                mode={modalMode}
                onClose={closeModal}
                onSave={handleSave}
            />
        </div>
    );
};

export default AssistantTreatmentPlans;
