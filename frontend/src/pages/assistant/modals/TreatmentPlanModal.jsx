import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TreatmentPlanModal = ({ plan, isOpen, mode, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        doctorName: '',
        planName: '',
        diagnosis: '',
        startDate: '',
        estimatedEndDate: '',
        totalCost: '',
        notes: '',
        phases: [{ name: '', status: 'pending', startDate: '', endDate: '' }]
    });

    useEffect(() => {
        if (plan && (mode === 'edit' || mode === 'view')) {
            setFormData({
                patientName: plan.patientName || '',
                patientPhone: plan.patientPhone || '',
                doctorName: plan.doctorName || '',
                planName: plan.planName || '',
                diagnosis: plan.diagnosis || '',
                startDate: plan.startDate || '',
                estimatedEndDate: plan.estimatedEndDate || '',
                totalCost: plan.totalCost || '',
                notes: plan.notes || '',
                phases: plan.phases || [{ name: '', status: 'pending', startDate: '', endDate: '' }]
            });
        } else if (mode === 'create') {
            setFormData({
                patientName: '',
                patientPhone: '',
                doctorName: '',
                planName: '',
                diagnosis: '',
                startDate: '',
                estimatedEndDate: '',
                totalCost: '',
                notes: '',
                phases: [{ name: '', status: 'pending', startDate: '', endDate: '' }]
            });
        }
    }, [plan, mode, isOpen]);

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhaseChange = (index, field, value) => {
        const newPhases = [...formData.phases];
        newPhases[index] = { ...newPhases[index], [field]: value };
        setFormData(prev => ({ ...prev, phases: newPhases }));
    };

    const addPhase = () => {
        setFormData(prev => ({
            ...prev,
            phases: [...prev.phases, { name: '', status: 'pending', startDate: '', endDate: '' }]
        }));
    };

    const removePhase = (index) => {
        if (formData.phases.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            phases: prev.phases.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const getPhaseStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'in_progress': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };

    const getPhaseStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} />;
            case 'in_progress': return <Clock size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '';
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Tạo kế hoạch điều trị mới';
            case 'edit': return 'Chỉnh sửa kế hoạch điều trị';
            case 'view': return 'Chi tiết kế hoạch điều trị';
            default: return 'Kế hoạch điều trị';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {/* Basic Info Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                            Thông tin chung
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên kế hoạch <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.planName}
                                    onChange={(e) => handleChange('planName', e.target.value)}
                                    placeholder="VD: Niềng răng chỉnh nha"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bệnh nhân <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => handleChange('patientName', e.target.value)}
                                    placeholder="Họ tên bệnh nhân"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SĐT bệnh nhân</label>
                                <input
                                    type="text"
                                    value={formData.patientPhone}
                                    onChange={(e) => handleChange('patientPhone', e.target.value)}
                                    placeholder="0901234567"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bác sĩ phụ trách <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.doctorName}
                                    onChange={(e) => handleChange('doctorName', e.target.value)}
                                    placeholder="Tên bác sĩ"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chẩn đoán chung <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.diagnosis}
                                onChange={(e) => handleChange('diagnosis', e.target.value)}
                                placeholder="Mô tả tình trạng chẩn đoán của bệnh nhân"
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-600"
                                disabled={isReadOnly}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dự kiến kết thúc</label>
                                <input
                                    type="date"
                                    value={formData.estimatedEndDate}
                                    onChange={(e) => handleChange('estimatedEndDate', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng chi phí (VNĐ)</label>
                                <input
                                    type="text"
                                    value={isReadOnly ? formatCurrency(formData.totalCost) : formData.totalCost}
                                    onChange={(e) => handleChange('totalCost', e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="VD: 45000000"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phases Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                Các giai đoạn điều trị ({formData.phases.length})
                            </h3>
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={addPhase}
                                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus size={16} />
                                    Thêm giai đoạn
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData.phases.map((phase, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border-2 transition-colors ${getPhaseStatusColor(phase.status)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Phase Number */}
                                        <div className="flex items-center gap-2 mt-1 shrink-0">
                                            {getPhaseStatusIcon(phase.status)}
                                            <span className="text-sm font-bold">#{index + 1}</span>
                                        </div>

                                        {/* Phase Details */}
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={phase.name}
                                                onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                                                placeholder="Tên giai đoạn (VD: Gắn mắc cài)"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium"
                                                disabled={isReadOnly}
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <input
                                                    type="date"
                                                    value={phase.startDate}
                                                    onChange={(e) => handlePhaseChange(index, 'startDate', e.target.value)}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                    disabled={isReadOnly}
                                                />
                                                <input
                                                    type="date"
                                                    value={phase.endDate}
                                                    onChange={(e) => handlePhaseChange(index, 'endDate', e.target.value)}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly ? (
                                                    <select
                                                        value={phase.status}
                                                        onChange={(e) => handlePhaseChange(index, 'status', e.target.value)}
                                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="pending">Chưa bắt đầu</option>
                                                        <option value="in_progress">Đang thực hiện</option>
                                                        <option value="completed">Hoàn thành</option>
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-2 text-sm font-medium">
                                                        {phase.status === 'completed' ? '✅ Hoàn thành' :
                                                            phase.status === 'in_progress' ? '🔄 Đang thực hiện' :
                                                                '⏳ Chưa bắt đầu'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        {!isReadOnly && formData.phases.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePhase(index)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Ghi chú bổ sung..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-600"
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            {isReadOnly ? 'Đóng' : 'Huỷ'}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                            >
                                {mode === 'create' ? 'Tạo kế hoạch' : 'Lưu thay đổi'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TreatmentPlanModal;
