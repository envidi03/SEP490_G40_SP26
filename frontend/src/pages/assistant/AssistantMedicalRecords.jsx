import { useState } from 'react';
import { FileText, Search, Eye, Edit, Clock, CheckCircle, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ViewRecordModal from './modals/ViewRecordModal';
import UpdateRecordModal from './modals/UpdateRecordModal';
import { getAllDentalRecords, updateDentalRecord } from '../../services/dentalRecordService';
import { useEffect } from 'react';

// Mock medical records data (removed)

const AssistantMedicalRecords = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined,
                filter_dental_record: filterStatus !== 'all' ? filterStatus : undefined,
            };

            const response = await getAllDentalRecords(params);
            console.log("Results: ", response);
            if (response && response.data) {
                setRecords(response.data);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                }
            }
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filterStatus]);

    // Use a debounced search or manual search button, here we just trigger on search term change for simplicity
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1); // Reset page on new search
            } else {
                fetchRecords();
            }
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const filteredRecords = records.filter(record => {
        // If we want to support local doctor filtering since it might not be supported natively by backend API
        const matchesSearch = (record.full_name?.toLowerCase() || record.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (record.phone || record.patientPhone || '').includes(searchTerm);
        const matchesDoctor = filterDoctor === 'all' ||
            (record.doctor_info && record.doctor_info.profile && record.doctor_info.profile.full_name === filterDoctor);
        return matchesSearch && matchesDoctor;
    });

    console.log("Filtered Records: ", filteredRecords);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'COMPLETED':
                return { label: 'Hoàn thành', variant: 'success', icon: CheckCircle };
            case 'IN_PROGRESS':
                return { label: 'Đang điều trị', variant: 'warning', icon: Clock };
            case 'CANCELLED':
                return { label: 'Đã hủy', variant: 'danger', icon: FileText };
            default:
                return { label: status, variant: 'default', icon: FileText };
        }
    };

    const handleViewClick = (record) => {
        setSelectedRecord(record);
        setShowViewModal(true);
    };

    const handleUpdateClick = (record) => {
        setSelectedRecord(record);
        setShowUpdateModal(true);
    };

    const closeModals = () => {
        setShowViewModal(false);
        setShowUpdateModal(false);
        setSelectedRecord(null);
    };

    const handleSaveRecord = async (recordId, data, isDraft) => {
        try {
            await updateDentalRecord(recordId, data);
            fetchRecords(); // Refresh data after update
            closeModals();
        } catch (error) {
            console.error('Error updating record:', error);
            // Optionally add toast notification here
        }
    };

    // Get unique doctors for filter based on current fetched records (or ideally from a separate API)
    const doctors = ['all', ...new Set(records.map(r => r.doctor_info?.profile?.full_name).filter(d => d))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hồ Sơ Bệnh Án</h1>
                <p className="text-gray-600 mt-1">Quản lý và cập nhật hồ sơ nha khoa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng hồ sơ</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                {records.length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đang điều trị</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">
                                {records.filter(r => r.status === 'IN_PROGRESS').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Clock size={24} className="text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hoàn thành</p>
                            <p className="text-3xl font-bold text-success-600 mt-1">
                                {records.filter(r => r.status === 'COMPLETED').length}
                            </p>
                        </div>
                        <div className="p-3 bg-success-100 rounded-full">
                            <CheckCircle size={24} className="text-success-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="IN_PROGRESS">Đang điều trị</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    {/* Doctor Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bác sĩ
                        </label>
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

            {/* Records List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                        const statusInfo = getStatusInfo(record.status);
                        const StatusIcon = statusInfo.icon;
                        const formattedDate = new Date(record.start_date || record.createdAt).toLocaleDateString('vi-VN');

                        return (
                            <Card key={record._id || record.id} className="hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Date Badge */}
                                        <div className="bg-primary-100 px-3 py-2 rounded-lg text-center min-w-[90px]">
                                            <div className="text-xs text-primary-600 font-medium">Ngày khám</div>
                                            <div className="text-sm font-bold text-primary-700">{formattedDate}</div>
                                        </div>

                                        {/* Record Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{record.full_name || record.patientName}</h3>
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">Hồ sơ:</span> {record.record_name}</p>
                                                <p><span className="font-medium">SĐT:</span> {record.phone || record.patientPhone}</p>
                                                <p><span className="font-medium">Bác sĩ:</span> {record.doctor_info?.profile?.full_name || record.doctorName || 'Chưa có'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleViewClick(record)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateClick(record)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Cập nhật"
                                        >
                                            <Edit size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Không tìm thấy hồ sơ nào</p>
                        </div>
                    </Card>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Modals */}
            <ViewRecordModal
                record={selectedRecord}
                isOpen={showViewModal}
                onClose={closeModals}
            />
            <UpdateRecordModal
                record={selectedRecord}
                isOpen={showUpdateModal}
                onClose={closeModals}
                onSave={handleSaveRecord}
            />
        </div>
    );
};

export default AssistantMedicalRecords;
