import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Calendar, User, Loader2, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import inventoryService from '../../services/inventoryService';

const PharmacyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dispensingId, setDispensingId] = useState(null);
    const [dispenseMsg, setDispenseMsg] = useState(null); // { type: 'success'|'error', text }

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
            };
            const res = await inventoryService.getPrescriptions(params);
            if (res?.success) setPrescriptions(res.data || []);
        } catch {
            setError('Không thể tải đơn thuốc. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        const timer = setTimeout(fetchPrescriptions, 400);
        return () => clearTimeout(timer);
    }, [fetchPrescriptions]);

    const handleDispense = async (prescription) => {
        if (!window.confirm(`Xác nhận xuất thuốc cho bệnh nhân ${prescription.patient_name}?\nThao tác này sẽ trừ tồn kho ngay lập tức.`)) return;
        setDispensingId(prescription._id);
        setDispenseMsg(null);
        try {
            const res = await inventoryService.dispensePrescription(prescription._id);
            if (res?.success) {
                setDispenseMsg({ type: 'success', text: `Xuất thuốc thành công cho ${prescription.patient_name}!` });
                fetchPrescriptions();
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Xuất thuốc thất bại.';
            setDispenseMsg({ type: 'error', text: msg });
        } finally {
            setDispensingId(null);
        }
    };

    const filteredPrescriptions = prescriptions;
    const pendingCount = prescriptions.filter(p => p.dispense_status === 'Chờ xuất').length;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Đơn Thuốc Sau Khám</h1>
                <p className="text-gray-600 mt-1">Xem danh sách thuốc sau khám và xuất thuốc</p>
            </div>

            {/* Thông báo xuất thuốc */}
            {dispenseMsg && (
                <div className={`mb-4 p-4 rounded-lg border flex items-start gap-2 ${dispenseMsg.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span className="text-sm flex-1">{dispenseMsg.text}</span>
                    <button onClick={() => setDispenseMsg(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
                </div>
            )}

            {/* Alert */}
            {!loading && pendingCount > 0 && (
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
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
            ) : error ? (
                <Card><div className="text-center py-8 text-red-500">{error}</div></Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPrescriptions.map((prescription) => (
                        <Card key={prescription._id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{prescription.patient_name}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {prescription.doctor_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(prescription.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={prescription.dispense_status === 'Chờ xuất' ? 'warning' : 'success'}>
                                    {prescription.dispense_status}
                                </Badge>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Danh sách thuốc:</h4>
                                <div className="space-y-2">
                                    {prescription.medicines.map((med, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                                            <div>
                                                <p className="font-medium text-gray-900">{med.medicine_name}</p>
                                                <p className="text-sm text-gray-600">{med.usage_instruction || med.dosage}</p>
                                            </div>
                                            <span className="text-sm font-medium text-primary-600">
                                                SL: {med.quantity} {med.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {prescription.dispense_status === 'Chờ xuất' && (
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => handleDispense(prescription)}
                                        disabled={dispensingId === prescription._id}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {dispensingId === prescription._id && <Loader2 size={16} className="animate-spin" />}
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
            )}
        </div>
    );
};

export default PharmacyPrescriptions;
