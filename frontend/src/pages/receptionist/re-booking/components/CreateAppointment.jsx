import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, User, Phone, Calendar, Clock, AlertCircle } from 'lucide-react';
import appointmentService from '../../../../services/appointmentService';

const CreateAppointment = ({ isOpen, onClose, treatmentData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        appointment_date: '',
        appointment_time: '',
        treatment_id: '',
        priority: 1
    });

    useEffect(() => {
        if (isOpen && treatmentData) {
            let defaultDate = '';
            if (treatmentData.planned_date) {
                defaultDate = treatmentData.planned_date.split('T')[0];
            }

            setFormData({
                full_name: treatmentData.record_info?.full_name || treatmentData.full_name || '',
                phone: treatmentData.record_info?.phone || treatmentData.phone || '',
                appointment_date: defaultDate, 
                appointment_time: '09:00', 
                treatment_id: treatmentData._id || '' 
            });
            setError(null);
        }
    }, [isOpen, treatmentData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.appointment_date || !formData.appointment_time) {
            setError("Vui lòng chọn ngày và giờ hẹn.");
            setLoading(false);
            return;
        }

        try {
            console.log("Dữ liệu gửi lên API tạo lịch hẹn:", formData);
            
            await appointmentService.staffCreateAppointment(formData);

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (onSuccess) onSuccess(); 
            onClose(); 
            
        } catch (err) {
            console.error("Lỗi tạo lịch hẹn:", err);
            setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-blue-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200">
                            <CalendarPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Xếp lịch hẹn</h2>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">Lên lịch cho phiếu điều trị</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form id="create-appointment-form" onSubmit={handleSubmit} className="space-y-5">
                        <input type="hidden" name="treatment_id" value={formData.treatment_id} />

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <User size={14} className="text-blue-500"/> Họ và tên BN
                            </label>
                            <input 
                                type="text" 
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-semibold text-slate-700 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Phone size={14} className="text-green-500"/> Số điện thoại
                            </label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-semibold text-slate-700 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Calendar size={14} className="text-orange-500"/> Ngày khám
                                </label>
                                <input 
                                    type="date" 
                                    name="appointment_date"
                                    min={today}
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Clock size={14} className="text-purple-500"/> Giờ khám
                                </label>
                                <input 
                                    type="time" 
                                    name="appointment_time"
                                    value={formData.appointment_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        form="create-appointment-form"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "Tạo lịch hẹn"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateAppointment;