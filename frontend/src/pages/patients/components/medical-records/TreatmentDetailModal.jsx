import React from 'react';
import {
    X, Calendar, MapPin, Activity, DollarSign,
    CheckCircle2, Pill
} from 'lucide-react';
import { getStatusBadge, formatCurrency } from './statusHelpers';

const TreatmentDetailModal = ({ treatment, onClose }) => {
    if (!treatment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-lg font-bold text-gray-900">Chi tiết điều trị</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-primary-600" />
                        <span className="font-medium text-gray-700">Trạng thái:</span>
                        {getStatusBadge(treatment.status)}
                    </div>

                    {/* Tooth position */}
                    {treatment.tooth_position && (
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-primary-600" />
                            <span className="font-medium text-gray-700">Vị trí răng:</span>
                            <span className="text-gray-600">{treatment.tooth_position}</span>
                        </div>
                    )}

                    {/* Planned date */}
                    {treatment.planned_date && (
                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-primary-600" />
                            <span className="font-medium text-gray-700">Ngày dự kiến:</span>
                            <span className="text-gray-600">{new Date(treatment.planned_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                    )}

                    {/* Performed date */}
                    {treatment.performed_date && (
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-green-600" />
                            <span className="font-medium text-gray-700">Ngày thực hiện:</span>
                            <span className="text-gray-600">{new Date(treatment.performed_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                    )}

                    {/* Price */}
                    {treatment.planned_price != null && (
                        <div className="flex items-center gap-3">
                            <DollarSign size={18} className="text-primary-600" />
                            <span className="font-medium text-gray-700">Chi phí dự kiến:</span>
                            <span className="text-gray-600 font-semibold">{formatCurrency(treatment.planned_price)}</span>
                        </div>
                    )}

                    {/* Result */}
                    {treatment.result && (
                        <div>
                            <span className="font-medium text-gray-700 block mb-1">Kết quả:</span>
                            <p className="text-gray-600 bg-gray-50 rounded-lg p-3 text-sm">{treatment.result}</p>
                        </div>
                    )}

                    {/* Note */}
                    {treatment.note && (
                        <div>
                            <span className="font-medium text-gray-700 block mb-1">Ghi chú bác sĩ:</span>
                            <p className="text-gray-600 bg-gray-50 rounded-lg p-3 text-sm italic">{treatment.note}</p>
                        </div>
                    )}

                    {/* Medicine usage */}
                    {treatment.medicine_usage && treatment.medicine_usage.length > 0 && (
                        <div>
                            <span className="font-medium text-gray-700 block mb-2 flex items-center gap-2">
                                <Pill size={16} className="text-primary-600" /> Thuốc sử dụng trong buổi này:
                            </span>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Tên thuốc</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-600">SL</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Hướng dẫn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {treatment.medicine_usage.map((med, i) => (
                                            <tr key={i} className="border-t border-gray-100">
                                                <td className="px-3 py-2 text-gray-800">
                                                    {med.medicine_id?.medicine_name || med.medicine_id?.name || `Thuốc #${i + 1}`}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-700">{med.quantity}</td>
                                                <td className="px-3 py-2 text-gray-600">{med.usage_instruction || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TreatmentDetailModal;
