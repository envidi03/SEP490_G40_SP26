import React, { useState } from 'react';
import { Pill, Search, Plus, Edit, AlertTriangle, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PharmacyMedicineModal from './PharmacyMedicineModal';

// Mock Medicines Data
const initialMedicines = [
    {
        id: 'med_001',
        name: 'Paracetamol 500mg',
        category: 'Giảm đau - Hạ sốt',
        dosage: '500mg',
        manufacturer: 'DHG Pharma',
        unit: 'Viên',
        price: 2000,
        stock: 500,
        minStock: 100,
        expiryDate: '2026-12-31',
        batchNumber: 'PCT-2024-001'
    },
    {
        id: 'med_002',
        name: 'Amoxicillin 500mg',
        category: 'Kháng sinh',
        dosage: '500mg',
        manufacturer: 'Traphaco',
        unit: 'Viên',
        price: 3500,
        stock: 300,
        minStock: 150,
        expiryDate: '2026-06-30',
        batchNumber: 'AMX-2024-002'
    },
    {
        id: 'med_003',
        name: 'Vitamin C 1000mg',
        category: 'Vitamin & Khoáng chất',
        dosage: '1000mg',
        manufacturer: 'Pharmacity',
        unit: 'Viên',
        price: 1500,
        stock: 50,
        minStock: 100,
        expiryDate: '2027-01-15',
        batchNumber: 'VTC-2024-003'
    },
    {
        id: 'med_004',
        name: 'Ibuprofen 400mg',
        category: 'Kháng viêm',
        dosage: '400mg',
        manufacturer: 'Sanofi',
        unit: 'Viên',
        price: 4000,
        stock: 200,
        minStock: 80,
        expiryDate: '2026-09-20',
        batchNumber: 'IBU-2024-004'
    },
    {
        id: 'med_005',
        name: 'Cetirizine 10mg',
        category: 'Kháng histamin',
        dosage: '10mg',
        manufacturer: 'Stada',
        unit: 'Viên',
        price: 2500,
        stock: 30,
        minStock: 50,
        expiryDate: '2026-11-10',
        batchNumber: 'CET-2024-005'
    }
];

const PharmacyMedicines = () => {
    const [medicines, setMedicines] = useState(initialMedicines);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const filteredMedicines = medicines.filter(med => {
        const matchesSearch =
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(medicines.map(m => m.category))];
    const lowStockCount = medicines.filter(m => m.stock < m.minStock).length;

    const handleOpenAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (medicine) => {
        setEditData(medicine);
        setModalOpen(true);
    };

    const handleModalSubmit = (data, isEdit) => {
        if (isEdit) {
            setMedicines(prev =>
                prev.map(m => (m.id === data.id ? { ...m, ...data } : m))
            );
        } else {
            const newMedicine = {
                ...data,
                id: `med_${Date.now()}`
            };
            setMedicines(prev => [...prev, newMedicine]);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thuốc</h1>
                <p className="text-gray-600 mt-1">Danh mục và thông tin thuốc</p>
            </div>

            {/* Alert for low stock */}
            {lowStockCount > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600" size={24} />
                    <div>
                        <p className="font-medium text-yellow-800">Cảnh báo tồn kho thấp</p>
                        <p className="text-sm text-yellow-700">Có {lowStockCount} loại thuốc sắp hết hàng</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thuốc theo tên, nhà sản xuất..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Thêm thuốc
                    </button>
                </div>
            </Card>

            {/* Medicines Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NSX</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSD</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMedicines.map((medicine) => (
                                <tr key={medicine.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                <Pill size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                                                <div className="text-xs text-gray-500">{medicine.unit}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{medicine.category}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{medicine.manufacturer}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-medium text-gray-900">
                                            {medicine.price.toLocaleString('vi-VN')}đ
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Badge variant={medicine.stock < medicine.minStock ? 'danger' : 'success'}>
                                            <Package size={14} className="inline mr-1" />
                                            {medicine.stock}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{medicine.expiryDate}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleOpenEdit(medicine)}
                                            className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMedicines.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Không tìm thấy thuốc nào
                    </div>
                )}
            </Card>

            {/* Add / Edit Medicine Modal */}
            <PharmacyMedicineModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                editData={editData}
            />
        </div>
    );
};

export default PharmacyMedicines;
