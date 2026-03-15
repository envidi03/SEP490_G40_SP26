import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, FileText, User, Calendar, CreditCard, Loader2 } from 'lucide-react';
import billingService from '../../../../services/billingService';
import serviceService from '../../../../services/serviceService';
// Assuming appointmentService is used to fetch patients/appointments
import appointmentService from '../../../../services/appointmentService';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, initialPatient }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Data lists
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]); // Used to link to patient/appointment
    const [filteredAppointments, setFilteredAppointments] = useState([]);

    // Form state
    const [searchApt, setSearchApt] = useState('');
    const [selectedApt, setSelectedApt] = useState(null);
    const [items, setItems] = useState([
        { service_id: '', quantity: 1, price: 0 }
    ]);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Reset form
            if (initialPatient) {
                // If opened from patient list, we might not have an appointment_id
                // but the createInvoice API requires it if we want to link.
                // However, the backend says appointment_id is optional in route but recommended.
                // If no appointment, we just pass patient_id.
                setSelectedApt(initialPatient);
                setSearchApt(initialPatient.full_name || initialPatient.name || '');
            } else {
                setSelectedApt(null);
                setSearchApt('');
            }
            setItems([{ service_id: '', quantity: 1, price: 0 }]);
            setNote('');
            setError(null);
        }
    }, [isOpen, initialPatient]);

    useEffect(() => {
        // Filter appointments based on search
        if (searchApt.trim() === '') {
            setFilteredAppointments(appointments.slice(0, 10)); // limit initially
        } else {
            const lowerSearch = searchApt.toLowerCase();
            const filtered = appointments.filter(apt =>
                (apt.full_name && apt.full_name.toLowerCase().includes(lowerSearch)) ||
                (apt.phone && apt.phone.includes(lowerSearch))
            );
            setFilteredAppointments(filtered.slice(0, 10));
        }
    }, [searchApt, appointments]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch services and appointments in parallel
            const [servicesRes, aptRes] = await Promise.all([
                serviceService.getAllServices(),
                appointmentService.getStaffAppointments() // Or similar endpoint
            ]);

            setServices(servicesRes?.data?.data || servicesRes?.data || []);

            const aptList = aptRes?.data?.data || aptRes?.data || [];
            // Preference for COMPLETED or IN_CONSULTATION appointments, as they are likely to be billed
            setAppointments(aptList);
            setFilteredAppointments(aptList.slice(0, 10));
        } catch (err) {
            console.error('Error fetching data for invoice modal:', err);
            setError('Không thể tải dữ liệu dịch vụ hoặc lịch hẹn.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { service_id: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-update price when service changes
        if (field === 'service_id') {
            const selectedService = services.find(s => s._id === value);
            if (selectedService) {
                newItems[index].price = selectedService.price || 0;
            } else {
                newItems[index].price = 0;
            }
        }

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedApt) {
            setError('Vui lòng chọn bệnh nhân / lịch hẹn để xuất hóa đơn.');
            return;
        }

        // Filter out empty items
        const validItems = items.filter(item => item.service_id && item.quantity > 0);
        if (validItems.length === 0) {
            setError('Vui lòng thêm ít nhất 1 dịch vụ hợp lệ.');
            return;
        }

        const payload = {
            patient_id: selectedApt.patient_id?._id || selectedApt.patient_id || selectedApt._id, // Adapt based on actual user ref
            appointment_id: selectedApt._id,
            items: validItems.map(item => ({
                service_id: item.service_id,
                quantity: parseInt(item.quantity)
            })),
            note: note
        };

        // Fallback: if appointment didn't have patient_id populated, but we still need it.
        // If patient_id is literally missing string, backend might reject. We assume patient_id is available.

        setSubmitting(true);
        try {
            await billingService.createInvoice(payload);
            setSubmitting(false);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating invoice:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo hóa đơn.');
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!submitting ? onClose : undefined}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-xl">
                            <FileText className="text-primary-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Tạo Hóa Đơn Mới</h2>
                            <p className="text-xs text-gray-500">Lập hóa đơn thanh toán cho bệnh nhân</p>
                        </div>
                    </div>
                    <button
                        onClick={!submitting ? onClose : undefined}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                            <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Select Appointment/Patient */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bệnh nhân / Lịch hẹn <span className="text-red-500">*</span>
                                </label>

                                {!selectedApt ? (
                                    <div className="relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={searchApt}
                                                onChange={(e) => setSearchApt(e.target.value)}
                                                placeholder="Tìm tên hoặc SĐT bệnh nhân..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>

                                        {/* Dropdown Results */}
                                        {filteredAppointments.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredAppointments.map(apt => (
                                                    <div
                                                        key={apt._id}
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{apt.full_name}</p>
                                                            <p className="text-xs text-gray-500">{apt.phone}</p>
                                                        </div>
                                                        <div className="text-right text-xs text-gray-500">
                                                            <p>{new Date(apt.appointment_date).toLocaleDateString('vi-VN')}</p>
                                                            <p className="text-primary-600 font-medium">{apt.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center p-4 bg-primary-50 border border-primary-100 rounded-lg">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold border border-primary-200">
                                                {selectedApt.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{selectedApt.full_name}</p>
                                                <p className="text-xs text-gray-600">{selectedApt.phone} • Lịch ngày {new Date(selectedApt.appointment_date).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedApt(null)}
                                            className="text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-1 bg-white rounded-lg border border-primary-200"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Services Line Items */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Dịch vụ điều trị <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Thêm dịch vụ
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <select
                                                    value={item.service_id}
                                                    onChange={(e) => handleItemChange(index, 'service_id', e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                >
                                                    <option value="">-- Chọn dịch vụ --</option>
                                                    {services.map(srv => (
                                                        <option key={srv._id} value={srv._id}>
                                                            {srv.name || srv.service_name} - {srv.price?.toLocaleString('vi-VN')}đ
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-center"
                                                    placeholder="SL"
                                                />
                                            </div>
                                            <div className="w-32 py-2 text-right font-medium text-gray-900 text-sm flex-shrink-0">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={items.length === 1}
                                                className={`p-2 rounded-lg transition-colors mt-0.5 ${items.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Total summary */}
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center px-2">
                                    <span className="font-semibold text-gray-700">Tổng phụ:</span>
                                    <span className="text-lg font-bold text-gray-900">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú thêm
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                    placeholder="Ví dụ: Bệnh nhân thanh toán trước, cần VAT..."
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="create-invoice-form"
                        disabled={submitting || loading || !selectedApt}
                        className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Đang tạo...</>
                        ) : (
                            <><Plus size={18} /> Tạo hóa đơn</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
