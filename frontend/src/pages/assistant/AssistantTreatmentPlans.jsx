import { useState, useEffect } from 'react';
import { ClipboardList, Search, Plus, Eye, Edit, CheckCircle, Clock, AlertCircle, Filter, Loader2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TreatmentPlanModal from './modals/TreatmentPlanModal';
import SharedPagination from '../../components/ui/SharedPagination';
import treatmentPlanService from '../../services/treatmentPlanService';
import patientService from '../../services/patientService';
import staffService from '../../services/staffService';
import appointmentService from '../../services/appointmentService';

const AssistantTreatmentPlans = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'

    const [plans, setPlans] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

    const loadData = async () => {
        try {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const [plansRes, patientsRes, staffRes, appointmentsRes] = await Promise.all([
                treatmentPlanService.getTreatmentPlans({ limit: 5, page: currentPage }),
                patientService.getAllPatients({ limit: 1000 }),
                staffService.getStaffs({ limit: 1000 }),
                appointmentService.getStaffAppointments({ appointment_date: today, limit: 1000 })
            ]);
            setPlans(plansRes?.data || []);
            const apiPagi = plansRes?.pagination || { totalItems: 0, size: 4, page: 1 };
            setPagination({
                ...apiPagi,
                totalPages: apiPagi.totalPages || Math.ceil(apiPagi.totalItems / (apiPagi.size || 4)) || 1
            });

            // Lọc bệnh nhân: Chỉ lấy những bệnh nhân có lịch khám hôm nay (Assistant view)
            const allPatients = patientsRes?.data?.data || patientsRes?.data || [];
            const todayAppointments = appointmentsRes?.data?.data || appointmentsRes?.data || [];

            // Trích xuất danh sách ID bệnh nhân từ lịch khám hôm nay
            const todayPatientIds = new Set(
                todayAppointments
                    .map(app => app.patient_id?.toString() || app.patient_id)
                    .filter(Boolean)
            );

            const todayPatients = allPatients.filter(p => todayPatientIds.has(p._id.toString()));
            setPatients(todayPatients);

            // Filter only doctors
            const allStaff = staffRes?.data?.data || staffRes?.data || [];
            const docs = allStaff.filter(s => s.account?.role_id?.name === 'DOCTOR');
            // Remove fallback to allStaff so it doesn't accidentally show non-doctors
            setDoctorsList(docs);
        } catch (error) {
            setToast({ show: true, message: 'Gặp lỗi khi tải dữ liệu', type: 'error' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage]);

    const filteredPlans = plans.filter(plan => {
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

    const handleSave = async (data) => {
        try {
            // Create proper payload
            const payload = {
                patient_id: data.patient_id,
                created_by: data.doctor_id, // For backend it expects created_by for the doctor
                full_name: data.patientName,
                phone: data.patientPhone,
                record_name: data.planName,
                diagnosis: data.diagnosis,
                start_date: data.startDate || new Date(),
                end_date: data.estimatedEndDate || null,
                total_amount: data.totalCost ? Number(data.totalCost) : 0,
                description: data.notes,
                phases: data.phases
            };

            if (modalMode === 'create') {
                await treatmentPlanService.createTreatmentPlan(payload);
                setToast({ show: true, message: 'Đã tạo kế hoạch mới thành công!', type: 'success' });
            } else if (modalMode === 'edit') {
                await treatmentPlanService.updateTreatmentPlan(selectedPlan.id, payload);
                setToast({ show: true, message: 'Đã cập nhật kế hoạch thành công!', type: 'success' });
            }
            closeModal();
            loadData(); // Reload list
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || 'Có lỗi xảy ra khi lưu kế hoạch', type: 'error' });
            console.error(error);
        }
    };

    // Get unique doctors for filter
    const doctors = ['all', ...new Set(plans.map(p => p.doctorName).filter(Boolean))];

    // Stats
    const stats = {
        total: plans.length,
        inProgress: plans.filter(p => p.status === 'in_progress').length,
        completed: plans.filter(p => p.status === 'completed').length,
        pending: plans.filter(p => p.status === 'pending').length,
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

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

            {/* Pagination */}
            {!isLoading && (
                <SharedPagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    itemLabel="kế hoạch"
                />
            )}

            {/* Modal */}
            <TreatmentPlanModal
                plan={selectedPlan}
                isOpen={showModal}
                mode={modalMode}
                onClose={closeModal}
                onSave={handleSave}
                patients={patients}
                doctors={doctorsList}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default AssistantTreatmentPlans;
