import React, { useState } from 'react';
import { Package, TrendingDown, TrendingUp, AlertCircle, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

// Reuse mockMedicines from PharmacyMedicines
const mockInventory = [
    { id: 'med_001', name: 'Paracetamol 500mg', stock: 500, minStock: 100, lastRestocked: '2026-01-10', trend: 'stable' },
    { id: 'med_002', name: 'Amoxicillin 500mg', stock: 300, minStock: 150, lastRestocked: '2026-01-08', trend: 'decreasing' },
    { id: 'med_003', name: 'Vitamin C 1000mg', stock: 50, minStock: 100, lastRestocked: '2025-12-20', trend: 'low' },
    { id: 'med_004', name: 'Ibuprofen 400mg', stock: 200, minStock: 80, lastRestocked: '2026-01-12', trend: 'stable' },
    { id: 'med_005', name: 'Cetirizine 10mg', stock: 30, minStock: 50, lastRestocked: '2025-12-25', trend: 'low' }
];

const PharmacyInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventory = mockInventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStock = mockInventory.reduce((sum, item) => sum + item.stock, 0);
    const lowStockItems = mockInventory.filter(item => item.stock < item.minStock);
    const criticalItems = mockInventory.filter(item => item.stock < item.minStock * 0.5);

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'decreasing':
            case 'low':
                return <TrendingDown className="text-red-500" size={16} />;
            default:
                return <TrendingUp className="text-green-500" size={16} />;
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Theo Dõi Tồn Kho</h1>
                <p className="text-gray-600 mt-1">Quản lý và theo dõi số lượng thuốc</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng số lượng</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalStock}</p>
                            <p className="text-xs text-gray-500 mt-1">Tất cả loại thuốc</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Package size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Sắp hết hàng</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{lowStockItems.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Dưới mức tối thiểu</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertCircle size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Cần nhập gấp</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{criticalItems.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Rất thấp</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <TrendingDown size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thuốc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </Card>

            {/* Inventory Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tối thiểu</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhập lần cuối</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Xu hướng</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInventory.map((item) => {
                                const percentage = (item.stock / item.minStock) * 100;
                                let statusVariant = 'success';
                                let statusText = 'Đủ hàng';

                                if (item.stock < item.minStock * 0.5) {
                                    statusVariant = 'danger';
                                    statusText = 'Rất thấp';
                                } else if (item.stock < item.minStock) {
                                    statusVariant = 'warning';
                                    statusText = 'Thấp';
                                }

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-gray-900">{item.stock}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm text-gray-600">{item.minStock}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={statusVariant}>{statusText}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{item.lastRestocked}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getTrendIcon(item.trend)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PharmacyInventory;
