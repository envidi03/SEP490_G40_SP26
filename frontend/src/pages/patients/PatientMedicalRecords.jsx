import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../../components/layout/PublicLayout';
import { FileText, ArrowLeft, Calendar, User, Stethoscope, Pill, DollarSign, ClipboardList } from 'lucide-react';

const PatientMedicalRecords = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock medical records data
    const [medicalRecords] = useState([
        {
            id: 1,
            date: '2026-01-10',
            doctorName: 'BS. Nguyễn Văn A',
            diagnosis: 'Sâu răng',
            treatment: 'Trám răng amalgam răng số 6 hàm dưới',
            prescription: 'Paracetamol 500mg - 2 viên/lần, 3 lần/ngày',
            notes: 'Tái khám sau 1 tuần',
            status: 'Completed',
            cost: 300000
        },
        {
            id: 2,
            date: '2026-01-05',
            doctorName: 'BS. Trần Thị B',
            diagnosis: 'Viêm nướu',
            treatment: 'Lấy cao răng, làm sạch răng miệng',
            prescription: 'Nước súc miệng Chlorhexidine - 2 lần/ngày',
            notes: 'Vệ sinh răng miệng đúng cách',
            status: 'Completed',
            cost: 150000
        },
        {
            id: 3,
            date: '2025-12-20',
            doctorName: 'BS. Nguyễn Văn A',
            diagnosis: 'Khám định kỳ',
            treatment: 'Kiểm tra tổng quát răng miệng',
            prescription: 'Không',
            notes: 'Răng miệng khỏe mạnh, tiếp tục duy trì vệ sinh',
            status: 'Completed',
            cost: 100000
        }
    ]);

    const [selectedRecord, setSelectedRecord] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ nha khoa</h1>
                        <p className="text-gray-600">Xem lịch sử khám và điều trị nha khoa</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{medicalRecords.length}</div>
                                    <div className="text-sm text-gray-600">Hồ sơ khám</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Calendar size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {new Date(medicalRecords[0]?.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-sm text-gray-600">Lần khám gần nhất</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DollarSign size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(medicalRecords.reduce((sum, r) => sum + r.cost, 0))}
                                    </div>
                                    <div className="text-sm text-gray-600">Tổng chi phí</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Records List */}
                    <div className="space-y-4">
                        {medicalRecords.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Chưa có hồ sơ nào
                                </h3>
                                <p className="text-gray-600">
                                    Bạn chưa có hồ sơ khám nha khoa nào
                                </p>
                            </div>
                        ) : (
                            medicalRecords.map((record) => (
                                <div
                                    key={record.id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    {/* Record Header */}
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <FileText size={24} className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {record.diagnosis}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {new Date(record.date).toLocaleDateString('vi-VN')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User size={14} />
                                                            {record.doctorName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-semibold text-primary-600">
                                                    {formatCurrency(record.cost)}
                                                </span>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    {selectedRecord?.id === record.id ? '▲' : '▼'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Record Details (Expandable) */}
                                    {selectedRecord?.id === record.id && (
                                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Treatment */}
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                                                        <Stethoscope size={18} className="text-primary-600" />
                                                        Điều trị
                                                    </div>
                                                    <p className="text-gray-600 ml-6">{record.treatment}</p>
                                                </div>

                                                {/* Prescription */}
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                                                        <Pill size={18} className="text-primary-600" />
                                                        Đơn thuốc
                                                    </div>
                                                    <p className="text-gray-600 ml-6">{record.prescription}</p>
                                                </div>

                                                {/* Notes */}
                                                {record.notes && (
                                                    <div className="md:col-span-2">
                                                        <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                                                            <ClipboardList size={18} className="text-primary-600" />
                                                            Ghi chú
                                                        </div>
                                                        <p className="text-gray-600 ml-6 italic">{record.notes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                                    Tải xuống PDF
                                                </button>
                                                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                                                    In hồ sơ
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PatientMedicalRecords;
