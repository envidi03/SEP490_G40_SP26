import React, { useEffect, useState } from 'react';
import { Pill, Package, FileText, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService from '../../services/inventoryService';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">
                    {value !== null && value !== undefined ? value.toLocaleString('vi-VN') : '—'}
                </p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </div>
    </Card>
);

const PharmacyDashboard = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState(null);
    const [lowStockMeds, setLowStockMeds] = useState([]);
    const [nearExpiredMeds, setNearExpiredMeds] = useState([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [statsRes, lowStockRes, nearExpiredRes, prescriptionsRes] = await Promise.all([
                    inventoryService.getDashboardStats(),
                    inventoryService.getLowStockMedicines(5),
                    inventoryService.getNearExpiredMedicines(30),
                    inventoryService.getPrescriptions({ status: 'pending', limit: 5 }),
                ]);

                if (statsRes?.success) setStats(statsRes.data);
                if (lowStockRes?.success) setLowStockMeds(lowStockRes.data || []);
                if (nearExpiredRes?.success) setNearExpiredMeds(nearExpiredRes.data || []);
                if (prescriptionsRes?.success) setRecentPrescriptions(prescriptionsRes.data || []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            icon: Pill,
            title: 'Tổng loại thuốc',
            value: stats?.totalMedicines ?? null,
            subtitle: 'Đang hoạt động',
            color: 'bg-blue-500',
        },
        {
            icon: Package,
            title: 'Tồn kho',
            value: stats?.totalInventoryQuantity ?? null,
            subtitle: 'Tổng số lượng',
            color: 'bg-green-500',
        },
        {
            icon: FileText,
            title: 'Đơn chờ xuất',
            value: stats?.pendingOrders ?? null,
            subtitle: 'Cần xử lý',
            color: 'bg-yellow-500',
        },
        {
            icon: AlertTriangle,
            title: 'Sắp hết hàng',
            value: stats?.lowStockCount ?? null,
            subtitle: 'Cần nhập thêm',
            color: 'bg-red-500',
        },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getDaysUntilExpiry = (dateStr) => {
        if (!dateStr) return null;
        const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-500">
                    <AlertTriangle size={48} className="mx-auto mb-3" />
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Trợ Lý Bán Thuốc</h1>
                <p className="text-gray-600 mt-1">Chào mừng, {user?.full_name}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert */}
                <Card title="Cảnh báo tồn kho thấp">
                    <div className="space-y-3">
                        {lowStockMeds.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Không có thuốc nào sắp hết hàng</p>
                        ) : (
                            lowStockMeds.map((med, idx) => (
                                <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">{med.medicine_name}</p>
                                            <p className="text-sm text-gray-600">Tối thiểu: {med.min_quantity?.toLocaleString('vi-VN')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">{med.quantity?.toLocaleString('vi-VN')}</p>
                                            <p className="text-xs text-red-600">Còn lại</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Tạo yêu cầu bổ sung
                        </button>
                    </div>
                </Card>

                {/* Near Expired Medicines */}
                <Card title="Thuốc sắp hết hạn (30 ngày)">
                    <div className="space-y-3">
                        {nearExpiredMeds.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Không có thuốc nào sắp hết hạn</p>
                        ) : (
                            nearExpiredMeds.map((med, idx) => {
                                const daysLeft = getDaysUntilExpiry(med.expiry_date);
                                return (
                                    <div key={idx} className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{med.medicine_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Hết hạn: {formatDate(med.expiry_date)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${daysLeft <= 7 ? 'text-red-600' : 'text-orange-500'}`}>
                                                    {daysLeft} ngày
                                                </p>
                                                <p className="text-xs text-gray-500">SL: {med.quantity?.toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Recent Pending Prescriptions */}
                <Card title="Đơn thuốc chờ xuất">
                    <div className="space-y-3">
                        {recentPrescriptions.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Không có đơn thuốc nào chờ xuất</p>
                        ) : (
                            recentPrescriptions.map((presc, idx) => (
                                <div
                                    key={presc._id || idx}
                                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {presc.patient_name || presc.patient?.full_name || 'Bệnh nhân'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                BS: {presc.doctor_name || presc.doctor?.full_name || '—'}
                                                {presc.medicines?.length
                                                    ? ` • ${presc.medicines.length} loại thuốc`
                                                    : ''}
                                            </p>
                                            {presc.created_at && (
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {formatDate(presc.created_at)}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={presc.dispense_status === 'dispensed' ? 'success' : 'warning'}>
                                            {presc.dispense_status === 'dispensed' ? 'Đã xuất' : 'Chờ xuất'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Xem tất cả đơn thuốc
                        </button>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Thao tác nhanh">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                            <Pill size={24} className="text-blue-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Quản lý thuốc</p>
                        </button>
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                            <Package size={24} className="text-green-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Kiểm tra tồn kho</p>
                        </button>
                        <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
                            <FileText size={24} className="text-yellow-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Xuất đơn thuốc</p>
                        </button>
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                            <TrendingUp size={24} className="text-purple-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Báo cáo</p>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
