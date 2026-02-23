import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clinicService from '../../../services/clinicService';
import Toast from '../../../components/ui/Toast';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    Search,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

/**
 * ClinicList - Danh sách tất cả phòng khám
 * 
 * Admin có thể xem danh sách phòng khám và click vào để xem chi tiết
 */
const ClinicList = () => {
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const response = await clinicService.getAllClinics();
            if (response && response.data) {
                setClinics(response.data);
            } else {
                setError('Không thể tải danh sách phòng khám');
            }
        } catch (err) {
            console.error('Error fetching clinics:', err);
            setError(err.message || 'Lỗi khi tải danh sách phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (clinicId) => {
        navigate(`/admin/clinic-info/${clinicId}`);
    };

    const filteredClinics = clinics.filter(clinic =>
        clinic.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.clinic_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách phòng khám...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-100">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Building2 className="text-blue-600" size={40} />
                        Danh sách Phòng khám
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Quản lý thông tin các phòng khám nha khoa trong hệ thống
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phòng khám theo tên, địa chỉ, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Clinic Cards Grid */}
                {filteredClinics.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                        <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
                        <p className="text-gray-600 text-lg">
                            {searchTerm ? 'Không tìm thấy phòng khám phù hợp' : 'Chưa có phòng khám nào trong hệ thống'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClinics.map((clinic) => (
                            <div
                                key={clinic._id || clinic.id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                                onClick={() => handleViewDetail(clinic._id || clinic.id)}
                            >
                                {/* Clinic Logo/Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Building2 size={32} />
                                        {clinic.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                                <CheckCircle size={14} />
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                                <AlertCircle size={14} />
                                                Tạm ngừng
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold">{clinic.clinic_name}</h3>
                                </div>

                                {/* Clinic Details */}
                                <div className="p-6 space-y-3">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                                        <span className="text-gray-700 line-clamp-2">{clinic.clinic_address}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="text-green-600 flex-shrink-0" size={16} />
                                        <span className="text-gray-700">{clinic.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="text-purple-600 flex-shrink-0" size={16} />
                                        <span className="text-gray-700 truncate">{clinic.email}</span>
                                    </div>

                                    {/* View Detail Button */}
                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetail(clinic._id || clinic.id);
                                            }}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            Xem chi tiết
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toast */}
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

export default ClinicList;
