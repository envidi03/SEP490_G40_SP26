import React, { useState } from 'react';
import { FileText, Search, Calendar, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

// Mock Prescriptions Data
const mockPrescriptions = [
    {
        id: 'presc_001',
        patientName: 'Nguyễn Văn A',
        doctorName: 'BS. Trần Thị B',
        date: '2026-01-15',
        status: 'pending',
        medicines: [
            { name: 'Paracetamol 500mg', quantity: 20, dosage: '2 viên/ngày' },
            { name: 'Vitamin C 1000mg', quantity: 30, dosage: '1 viên/ngày' }
        ]
    },
    {
        id: 'presc_002',
        patientName: 'Lê Thị C',
        doctorName: 'BS. Phạm Văn D',
        date: '2026-01-14',
        status: 'completed',
        medicines: [
            { name: 'Amoxicillin 500mg', quantity: 21, dosage: '3 viên/ngày' }
        ]
    },
    {
        id: 'presc_003',
        patientName: 'Trần Văn E',
        doctorName: 'BS. Trần Thị B',
        date: '2026-01-15',
        status: 'pending',
        medicines: [
            { name: 'Ibuprofen 400mg', quantity: 10, dosage: '2 viên khi đau' },
            { name: 'Cetirizine 10mg', quantity: 14, dosage: '1 viên/ngày' }
        ]
    }
];

const PharmacyPrescriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredPrescriptions = mockPrescriptions.filter(presc => {
        const matchesSearch = presc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            presc.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || presc.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = mockPrescriptions.filter(p => p.status === 'pending').length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Đơn Thuốc Sau Khám</h1>
                <p className="text-gray-600 mt-1">Xem danh sách thuốc sau khám và xuất thuốc</p>
            </div>

            {/* Alert */}
            {pendingCount > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">{pendingCount} đơn thuốc</span> đang chờ xuất hàng
                    </p>
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xuất</option>
                        <option value="completed">Đã xuất</option>
                    </select>
                </div>
            </Card>

            {/* Prescriptions List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPrescriptions.map((prescription) => (
                    <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{prescription.patientName}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {prescription.doctorName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {prescription.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant={prescription.status === 'pending' ? 'warning' : 'success'}>
                                {prescription.status === 'pending' ? 'Chờ xuất' : 'Đã xuất'}
                            </Badge>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Danh sách thuốc:</h4>
                            <div className="space-y-2">
                                {prescription.medicines.map((med, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                                        <div>
                                            <p className="font-medium text-gray-900">{med.name}</p>
                                            <p className="text-sm text-gray-600">{med.dosage}</p>
                                        </div>
                                        <span className="text-sm font-medium text-primary-600">
                                            SL: {med.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {prescription.status === 'pending' && (
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                    Xuất thuốc
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    In đơn
                                </button>
                            </div>
                        )}
                    </Card>
                ))}

                {filteredPrescriptions.length === 0 && (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            Không tìm thấy đơn thuốc nào
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PharmacyPrescriptions;
