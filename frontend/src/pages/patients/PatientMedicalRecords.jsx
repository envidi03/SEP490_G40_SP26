import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import treatmentService from '../../services/treatmentService';
import PublicLayout from '../../components/layout/PublicLayout';
import {
    FileText, ArrowLeft, Calendar, User, DollarSign,
    Loader2, ChevronDown, ChevronUp, ListChecks, Stethoscope, Pill
} from 'lucide-react';
import Toast from '../../components/ui/Toast';

// Sub-components
import { getStatusBadge, formatCurrency } from './components/medical-records/statusHelpers';
import TreatmentPlanTab from './components/medical-records/TreatmentPlanTab';
import TreatmentsTab from './components/medical-records/TreatmentsTab';

import TreatmentDetailModal from './components/medical-records/TreatmentDetailModal';

const TABS = [
    { key: 'plan', label: 'Kế hoạch điều trị', icon: ListChecks },
    { key: 'treatments', label: 'Quá trình điều trị', icon: Stethoscope },
];

const PatientMedicalRecords = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [activeTab, setActiveTab] = useState({});
    const [detailTreatment, setDetailTreatment] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const response = await treatmentService.getPatientDentalRecords();
                const recordsData = response.data?.data || response.data || [];
                setMedicalRecords(recordsData);
            } catch (err) {
                console.error('Error fetching medical records:', err);
                setError('Không thể tải lịch sử điều trị. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const toggleRecord = (id) => {
        if (selectedRecordId === id) {
            setSelectedRecordId(null);
        } else {
            setSelectedRecordId(id);
            if (!activeTab[id]) setActiveTab(prev => ({ ...prev, [id]: 'plan' }));
        }
    };

    const switchTab = (recordId, tab) => {
        setActiveTab(prev => ({ ...prev, [recordId]: tab }));
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ nha khoa</h1>
                        <p className="text-gray-600">Xem lịch sử khám và điều trị nha khoa</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{medicalRecords.length}</div>
                                    <div className="text-sm text-gray-600">Hồ sơ khám</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Calendar size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {medicalRecords.length > 0
                                            ? new Date(medicalRecords[0]?.start_date).toLocaleDateString('vi-VN')
                                            : '—'}
                                    </div>
                                    <div className="text-sm text-gray-600">Lần khám gần nhất</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DollarSign size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(medicalRecords.reduce((sum, r) => sum + (r.total_amount || 0), 0))}
                                    </div>
                                    <div className="text-sm text-gray-600">Tổng chi phí</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Records List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={40} className="animate-spin text-primary-500" />
                                <span className="ml-3 text-gray-500 text-lg">Đang tải hồ sơ của bạn...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
                                <p className="font-medium">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm transition-colors"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : medicalRecords.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hồ sơ nào</h3>
                                <p className="text-gray-600">Bạn chưa có hồ sơ khám nha khoa nào</p>
                            </div>
                        ) : (
                            medicalRecords.map((record) => {
                                const isExpanded = selectedRecordId === record._id;
                                const currentTab = activeTab[record._id] || 'plan';

                                return (
                                    <div key={record._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                        {/* ── Record Header ── */}
                                        <div className="p-6 cursor-pointer" onClick={() => toggleRecord(record._id)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                        <FileText size={24} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {record.record_name || 'Hồ sơ điều trị'}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {new Date(record.start_date || record.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User size={14} />
                                                                {record.doctor_info?.full_name || 'Bác sĩ phụ trách'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {getStatusBadge(record.status)}
                                                    <span className="text-lg font-semibold text-primary-600">
                                                        {formatCurrency(record.total_amount || 0)}
                                                    </span>
                                                    {isExpanded
                                                        ? <ChevronUp size={20} className="text-gray-400" />
                                                        : <ChevronDown size={20} className="text-gray-400" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Expanded Detail ── */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-200">
                                                {/* Record Overview */}
                                                <div className="px-6 pt-5 pb-3 bg-gray-50 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                    {record.diagnosis && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Chẩn đoán: </span>
                                                            <span className="text-gray-600">{record.diagnosis}</span>
                                                        </div>
                                                    )}
                                                    {record.tooth_status && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Tình trạng răng: </span>
                                                            <span className="text-gray-600">{record.tooth_status}</span>
                                                        </div>
                                                    )}
                                                    {record.description && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Ghi chú: </span>
                                                            <span className="text-gray-600 italic">{record.description}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tab Bar */}
                                                <div className="px-6 pt-2 bg-gray-50 flex gap-1 border-b border-gray-200">
                                                    {TABS.map(tab => {
                                                        const Icon = tab.icon;
                                                        const isActive = currentTab === tab.key;
                                                        return (
                                                            <button
                                                                key={tab.key}
                                                                onClick={() => switchTab(record._id, tab.key)}
                                                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${isActive
                                                                    ? 'bg-white text-primary-700 border border-gray-200 border-b-white -mb-px'
                                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <Icon size={16} />
                                                                {tab.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Tab Content */}
                                                <div className="p-6">
                                                    {currentTab === 'plan' && (
                                                        <TreatmentPlanTab
                                                            treatments={record.treatments}
                                                            onViewDetail={setDetailTreatment}
                                                        />
                                                    )}
                                                    {currentTab === 'treatments' && (
                                                        <TreatmentsTab
                                                            treatments={record.treatments}
                                                            onViewDetail={setDetailTreatment}
                                                        />
                                                    )}

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Treatment Detail Modal */}
            {detailTreatment && (
                <TreatmentDetailModal
                    treatment={detailTreatment}
                    onClose={() => setDetailTreatment(null)}
                />
            )}

            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </PublicLayout>
    );
};

export default PatientMedicalRecords;
