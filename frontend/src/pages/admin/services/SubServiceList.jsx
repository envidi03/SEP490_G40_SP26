import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Plus, Edit2, Trash2, CheckCircle, XCircle, 
    Clock, DollarSign, AlertTriangle, ArrowLeft,
    Search, LayoutGrid, List
} from 'lucide-react';
import subServiceService from '../../../services/subServiceService';
import serviceService from '../../../services/serviceService';
import SubServiceFormModal, { EMPTY_FORM } from './components/SubServiceFormModal';

const SubServiceList = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    const [parentService, setParentService] = useState(null);
    const [subServices, setSubServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [success, setSuccess] = useState('');

    // SubService form modal state
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSubService, setSelectedSubService] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Delete confirm
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!serviceId) return;
        try {
            setLoading(true);
            setError('');
            
            // Lấy thông tin dịch vụ cha
            const parentRes = await serviceService.getServiceById(serviceId);
            setParentService(parentRes?.data || null);

            // Lấy danh sách gói dịch vụ
            const subRes = await subServiceService.getSubServicesByParent(serviceId);
            setSubServices(subRes?.data || []);
        } catch (err) {
            setError('Không thể tải dữ liệu dịch vụ.');
        } finally {
            setLoading(false);
        }
    }, [serviceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showSuccessMsg = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Mở form thêm mới
    const handleOpenAdd = () => {
        setIsEditMode(false);
        setSelectedSubService(null);
        setFormData({ ...EMPTY_FORM });
        setModalError('');
        setShowForm(true);
    };

    // Mở form sửa
    const handleOpenEdit = (sub) => {
        setIsEditMode(true);
        setSelectedSubService(sub);
        setFormData({
            sub_service_name: sub.sub_service_name || '',
            description: sub.description || '',
            min_price: sub.min_price || '',
            max_price: sub.max_price || '',
            duration: sub.duration || '',
            note: sub.note || '',
            images: sub.images || [],
            status: sub.status || 'AVAILABLE'
        });
        setModalError('');
        setShowForm(true);
    };

    // Lưu (tạo mới hoặc cập nhật)
    const handleSave = async () => {
        if (!formData.sub_service_name?.trim()) {
            setModalError('Vui lòng nhập tên gói dịch vụ!');
            return;
        }
        if (!formData.min_price || Number(formData.min_price) < 0) {
            setModalError('Vui lòng nhập giá thấp nhất hợp lệ!');
            return;
        }

        try {
            setSaving(true);
            setModalError('');
            const payload = {
                ...formData,
                min_price: Number(formData.min_price),
                max_price: formData.max_price ? Number(formData.max_price) : null,
                duration: Number(formData.duration) || 0
            };

            if (isEditMode) {
                await subServiceService.updateSubService(selectedSubService._id, payload);
                showSuccessMsg('✅ Cập nhật gói dịch vụ thành công!');
            } else {
                await subServiceService.createSubService(serviceId, payload);
                showSuccessMsg('✅ Thêm gói dịch vụ thành công!');
            }

            setShowForm(false);
            fetchData();
        } catch (err) {
            setModalError(err?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Xóa gói dịch vụ
    const handleDelete = async (subId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return;
        try {
            setDeletingId(subId);
            setError('');
            await subServiceService.deleteSubService(subId);
            showSuccessMsg('✅ Đã xóa gói dịch vụ!');
            fetchData();
        } catch (err) {
            setError(err?.data?.message || 'Không thể xóa gói dịch vụ.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50/50">
            {/* Header / Navigation */}
            <div className="max-w-7xl mx-auto mb-8">
                <button 
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Quay lại danh sách dịch vụ</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                Quản lý gói dịch vụ
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            {parentService?.service_name || 'Đang tải...'}
                        </h1>
                        <p className="mt-2 text-gray-500 max-w-2xl">
                            Quản lý các gói dịch vụ và mức giá chi tiết cho <span className="text-blue-600 font-semibold">{parentService?.service_name}</span>.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Thêm gói dịch vụ mới
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Alerts */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 animate-in fade-in slide-in-from-top-4 duration-300">
                        <CheckCircle size={20} className="shrink-0" />
                        <p className="font-medium">{success}</p>
                    </div>
                )}

                {/* Sub-services List */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                        <p className="text-gray-500 font-medium">Đang tải danh sách gói dịch vụ...</p>
                    </div>
                ) : subServices.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có gói dịch vụ nào</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Bắt đầu tạo các gói dịch vụ nhỏ hơn để khách hàng có thêm nhiều lựa chọn đa dạng.
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-all"
                        >
                            <Plus size={20} />
                            Tạo gói dịch vụ ngay
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subServices.map((sub) => (
                            <div
                                key={sub._id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
                            >
                                {/* Images Header */}
                                {sub.images && sub.images.length > 0 ? (
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={sub.images[0]} 
                                            alt={sub.sub_service_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                        {sub.images.length > 1 && (
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-bold border border-white/20">
                                                +{sub.images.length - 1} ảnh
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                                )}

                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                                {sub.sub_service_name}
                                            </h4>
                                            {sub.status === 'AVAILABLE' ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                                    <CheckCircle size={10} /> Đang hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                                    <XCircle size={10} /> Tạm dừng
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                                        {sub.description || 'Chưa có mô tả chi tiết cho dịch vụ này.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <DollarSign size={10} /> Giá dịch vụ
                                            </p>
                                            <p className="text-sm font-bold text-green-600">
                                                {sub.max_price && sub.max_price !== sub.min_price 
                                                    ? `${formatCurrency(sub.min_price)}`
                                                    : formatCurrency(sub.min_price)}
                                            </p>
                                            {sub.max_price && sub.max_price !== sub.min_price && (
                                                <p className="text-[9px] text-gray-400">Đến {formatCurrency(sub.max_price)}</p>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <Clock size={10} /> Thời gian
                                            </p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {sub.duration} phút
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(sub)}
                                            className="p-2.5 text-blue-600 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-95"
                                            title="Sửa thông tin"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub._id)}
                                            disabled={deletingId === sub._id}
                                            className="p-2.5 text-red-600 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                            title="Xóa dịch vụ"
                                        >
                                            {deletingId === sub._id ? (
                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                    {/* ID removed by user request */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sub-service form modal (nested) */}
            <SubServiceFormModal
                show={showForm}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                onClose={() => setShowForm(false)}
                loading={saving}
                error={modalError}
            />
        </div>
    );
};

export default SubServiceList;
