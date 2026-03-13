import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import subServiceService from '../../../../services/subServiceService';
import SubServiceFormModal, { EMPTY_FORM } from './SubServiceFormModal';

const SubServiceManagerModal = ({ show, parentService, onClose }) => {
    const [subServices, setSubServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // SubService form modal state
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSubService, setSelectedSubService] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Delete confirm
    const [deletingId, setDeletingId] = useState(null);

    const fetchSubServices = useCallback(async () => {
        if (!parentService?._id) return;
        try {
            setLoading(true);
            setError('');
            const res = await subServiceService.getSubServicesByParent(parentService._id);
            setSubServices(res?.data || []);
        } catch (err) {
            setError('Không thể tải danh sách dịch vụ con.');
        } finally {
            setLoading(false);
        }
    }, [parentService?._id]);

    useEffect(() => {
        if (show) {
            fetchSubServices();
            setError('');
            setSuccess('');
        }
    }, [show, fetchSubServices]);

    const showSuccessMsg = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Mở form thêm mới
    const handleOpenAdd = () => {
        setIsEditMode(false);
        setSelectedSubService(null);
        setFormData({ ...EMPTY_FORM });
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
        setShowForm(true);
    };

    // Lưu (tạo mới hoặc cập nhật)
    const handleSave = async () => {
        if (!formData.sub_service_name?.trim()) {
            setError('Vui lòng nhập tên dịch vụ con!');
            return;
        }
        if (!formData.min_price || Number(formData.min_price) < 0) {
            setError('Vui lòng nhập giá thấp nhất hợp lệ!');
            return;
        }

        try {
            setSaving(true);
            setError('');
            const payload = {
                ...formData,
                min_price: Number(formData.min_price),
                max_price: formData.max_price ? Number(formData.max_price) : null,
                duration: Number(formData.duration) || 0
            };

            if (isEditMode) {
                await subServiceService.updateSubService(selectedSubService._id, payload);
                showSuccessMsg('✅ Cập nhật dịch vụ con thành công!');
            } else {
                await subServiceService.createSubService(parentService._id, payload);
                showSuccessMsg('✅ Thêm dịch vụ con thành công!');
            }

            setShowForm(false);
            fetchSubServices();
        } catch (err) {
            setError(err?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Xóa dịch vụ con
    const handleDelete = async (subId) => {
        try {
            setDeletingId(subId);
            setError('');
            await subServiceService.deleteSubService(subId);
            showSuccessMsg('✅ Đã xóa dịch vụ con!');
            fetchSubServices();
        } catch (err) {
            setError(err?.data?.message || 'Không thể xóa dịch vụ con.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    if (!show) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">Quản lý dịch vụ con</h2>
                                    <p className="text-blue-100 mt-1">
                                        Dịch vụ cha: <span className="font-semibold text-white">{parentService?.service_name}</span>
                                    </p>
                                </div>
                                <button onClick={onClose} className="text-white/80 hover:text-white p-1">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Actions bar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {subServices.length} dịch vụ con
                            </p>
                            <button
                                onClick={handleOpenAdd}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm"
                            >
                                <Plus size={16} />
                                Thêm dịch vụ con
                            </button>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                                <CheckCircle size={16} />
                                {success}
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                                </div>
                            ) : subServices.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <div className="text-5xl mb-4">🦷</div>
                                    <p className="text-lg font-medium text-gray-500">Chưa có dịch vụ con nào</p>
                                    <p className="text-sm mt-1">Nhấn "Thêm dịch vụ con" để bắt đầu</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {subServices.map((sub) => (
                                        <div
                                            key={sub._id}
                                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-gray-800 text-sm">
                                                        {sub.sub_service_name}
                                                    </h4>
                                                    {sub.status === 'AVAILABLE' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                            <CheckCircle size={10} /> Hoạt động
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                            <XCircle size={10} /> Ngừng
                                                        </span>
                                                    )}
                                                </div>
                                                {sub.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sub.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                                                        <DollarSign size={12} />
                                                        {sub.max_price && sub.max_price !== sub.min_price 
                                                            ? `${formatCurrency(sub.min_price)} - ${formatCurrency(sub.max_price)}`
                                                            : formatCurrency(sub.min_price)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                                                        <Clock size={12} />
                                                        {sub.duration} phút
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEdit(sub)}
                                                    className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub._id)}
                                                    disabled={deletingId === sub._id}
                                                    className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    {deletingId === sub._id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
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
            />
        </>
    );
};

export default SubServiceManagerModal;
