import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const PrescriptionModal = ({ prescription, isOpen, mode, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        doctorName: '',
        date: '',
        diagnosis: '',
        notes: '',
        items: [{ name: '', quantity: '', dosage: '', unit: 'viên' }]
    });

    useEffect(() => {
        if (prescription && (mode === 'edit' || mode === 'view')) {
            setFormData({
                patientName: prescription.patientName || '',
                patientPhone: prescription.patientPhone || '',
                doctorName: prescription.doctorName || '',
                date: prescription.date || '',
                diagnosis: prescription.diagnosis || '',
                notes: prescription.notes || '',
                items: prescription.items || [{ name: '', quantity: '', dosage: '', unit: 'viên' }]
            });
        } else if (mode === 'create') {
            setFormData({
                patientName: '',
                patientPhone: '',
                doctorName: '',
                date: new Date().toISOString().split('T')[0],
                diagnosis: '',
                notes: '',
                items: [{ name: '', quantity: '', dosage: '', unit: 'viên' }]
            });
        }
    }, [prescription, mode, isOpen]);

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: '', dosage: '', unit: 'viên' }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Kê đơn thuốc mới';
            case 'edit': return 'Chỉnh sửa đơn thuốc';
            case 'view': return 'Chi tiết đơn thuốc';
            default: return 'Đơn thuốc';
        }
    };

    const unitOptions = ['viên', 'chai', 'tuýp', 'gói', 'ống', 'hộp', 'lọ', 'vỉ'];

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
                    {/* Basic Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                            Thông tin chung
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    Bác sĩ kê đơn <span className="text-red-500">*</span>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kê đơn</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleChange('date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chẩn đoán <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.diagnosis}
                                onChange={(e) => handleChange('diagnosis', e.target.value)}
                                placeholder="VD: Sâu răng hàm số 6"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                disabled={isReadOnly}
                                required
                            />
                        </div>
                    </div>

                    {/* Drug Items */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                Danh sách thuốc ({formData.items.length})
                            </h3>
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus size={16} />
                                    Thêm thuốc
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50 hover:border-blue-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Item Number */}
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                                            {index + 1}
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        placeholder="Tên thuốc (VD: Amoxicillin 500mg)"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium"
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        placeholder="SL"
                                                        min="1"
                                                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                        disabled={isReadOnly}
                                                    />
                                                    {!isReadOnly ? (
                                                        <select
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                            className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {unitOptions.map(u => (
                                                                <option key={u} value={u}>{u}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="flex-1 px-2 py-2 text-sm text-gray-600">{item.unit}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={item.dosage}
                                                onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                                                placeholder="Liều dùng (VD: 1 viên x 3 lần/ngày x 5 ngày)"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        {!isReadOnly && formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Dặn dò</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Lưu ý cho bệnh nhân (VD: Uống sau ăn, kiêng đồ cứng...)"
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
                                {mode === 'create' ? 'Kê đơn' : 'Lưu thay đổi'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionModal;
