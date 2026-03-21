import React, { useState, useEffect } from "react"

const PatientInfoModal = ({ isOpen, onClose, appointment, onConfirm }) => {
    const [form, setForm] = useState({
        appointment_id: appointment?._id || appointment?.appointment_id || "",
        name: "",
        dob: "",
        gender: "Nam",
        phone: "",
    })

    useEffect(() => {
        if (appointment) {
            setForm({
                appointment_id: appointment._id || appointment.appointment_id || "",
                name: appointment.patient_id?.full_name || appointment.patientName || "",
                dob: appointment.patient_id?.dob ? new Date(appointment.patient_id.dob).toISOString().split('T')[0] : "",
                gender: appointment.patient_id?.gender ? "Nam" : "Nữ",
                phone: appointment.patient_id?.phone || appointment.patientPhone || "",
            });
        }
    }, [appointment]);

    if (!isOpen || !appointment) return null

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onConfirm(form)
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Tạo Hồ Sơ Nha Khoa</h2>
                        <p className="text-[12px] text-slate-500 mt-0.5">Xác nhận nhân thân bệnh nhân trước khi mở hồ sơ</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Focus Info */}
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                        <p className="text-[11px] font-semibold text-teal-800 uppercase tracking-widest mb-1.5">Liên kết lịch hẹn</p>
                        <p className="text-[13px] text-teal-900">
                            <span className="font-bold">{appointment.code || appointment.appointment_id || "LH"}</span> — {appointment.appointment_type || appointment.reason || "Khám bệnh"}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                                HỌ VÀ TÊN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-[13px] font-medium text-slate-800 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                                    NGÀY SINH
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={form.dob}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-[13px] text-slate-800 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                                    GIỚI TÍNH
                                </label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-[13px] text-slate-800 transition-colors bg-white"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                                SỐ ĐIỆN THOẠI
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-[13px] font-medium text-slate-800 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Hủy lệnh
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-[13px] font-medium text-white bg-teal-500 rounded-xl hover:bg-teal-600 shadow-sm shadow-teal-500/20 transition-all"
                        >
                            Đến trang Hồ Sơ ➔
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PatientInfoModal
