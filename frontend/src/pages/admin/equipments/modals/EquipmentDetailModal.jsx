import React from 'react';
import { X, Calendar, Wrench, AlertTriangle, CheckCircle, Activity, Box, Hash } from 'lucide-react';

const EquipmentDetailModal = ({ show, equipment, onClose, formatDate, getStatusColor, getStatusText }) => {
    if (!show || !equipment) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="pr-8">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 bg-white/20 border-white/30 text-white">
                                {equipment.equipment_type}
                            </span>
                            <h2 className="text-2xl font-bold">
                                {equipment.equipment_name}
                            </h2>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Status Section */}
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-gray-600 font-medium">Trạng thái hiện tại</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(equipment.status)} bg-white`}>
                                {getStatusText(equipment.status)}
                            </span>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <Hash size={14} /> Số Serial
                                </p>
                                <p className="text-lg font-bold text-gray-900 font-mono">
                                    {equipment.equipment_serial_number || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <Calendar size={14} /> Ngày mua
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatDate(equipment.purchase_date)}
                                </p>
                            </div>
                        </div>

                        {/* Supplier and Warranty */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Box size={16} className="text-blue-600" />
                                Thông tin bổ sung
                            </h3>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                                {equipment.supplier && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Nhà cung cấp:</span>
                                        <span className="font-semibold text-gray-900">{equipment.supplier}</span>
                                    </div>
                                )}
                                {equipment.warranty && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Hạn bảo hành:</span>
                                        <span className="font-semibold text-blue-600">{formatDate(equipment.warranty)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailModal;
