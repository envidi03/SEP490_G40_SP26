import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';

const INITIAL_FORM = {
    name: '',
    category: '',
    dosage: '',
    manufacturer: '',
    unit: '',
    price: '',
    stock: '',
    minStock: '',
    expiryDate: '',
    batchNumber: ''
};

const CATEGORIES = [
    'Giảm đau - Hạ sốt',
    'Kháng sinh',
    'Kháng viêm',
    'Thuốc gây tê',
    'Vitamin & Khoáng chất',
    'Kháng histamin',
    'Dung dịch sát trùng',
    'Thuốc súc miệng kháng khuẩn',
    'Vật liệu nha khoa',
    'Khác'
];

const UNITS = ['Viên', 'Chai', 'Lọ', 'Tuýp', 'Hộp', 'Bộ', 'Gói', 'ml'];

const PharmacyMedicineModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
    const isEdit = !!editData;
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    // Khi mở modal chỉnh sửa, load dữ liệu vào form
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setFormData({
                    name: editData.name || '',
                    category: editData.category || '',
                    dosage: editData.dosage || '',
                    manufacturer: editData.manufacturer || '',
                    unit: editData.unit || '',
                    price: editData.price?.toString() || '',
                    stock: editData.stock?.toString() || '',
                    minStock: editData.minStock?.toString() || '',
                    expiryDate: editData.expiryDate || '',
                    batchNumber: editData.batchNumber || ''
                });
            } else {
                setFormData(INITIAL_FORM);
            }
            setErrors({});
        }
    }, [isOpen, editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên thuốc';
        if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Vui lòng nhập nhà sản xuất';
        if (!formData.unit) newErrors.unit = 'Vui lòng chọn đơn vị';
        if (!formData.price || Number(formData.price) < 0) newErrors.price = 'Giá phải >= 0';
        if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Tồn kho phải >= 0';
        if (!formData.minStock || Number(formData.minStock) < 0) newErrors.minStock = 'Tồn kho tối thiểu phải >= 0';
        if (!formData.expiryDate) newErrors.expiryDate = 'Vui lòng chọn hạn sử dụng';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            minStock: Number(formData.minStock),
            ...(isEdit && { id: editData.id })
        };
        onSubmit(payload, isEdit);
        handleClose();
    };

    const handleClose = () => {
        setFormData(INITIAL_FORM);
        setErrors({});
        onClose();
    };

    const inputClass = (field) =>
        `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? 'Chỉnh Sửa Thuốc' : 'Thêm Thuốc Mới'}
            size="xl"
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Thêm thuốc'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Tên thuốc + Liều dùng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên thuốc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="VD: Paracetamol 500mg"
                            className={inputClass('name')}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Liều dùng
                        </label>
                        <input
                            type="text"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            placeholder="VD: 500mg, 2%..."
                            className={inputClass('dosage')}
                        />
                    </div>
                </div>

                {/* Danh mục + NSX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={inputClass('category')}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nhà sản xuất <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            placeholder="VD: DHG Pharma, Sanofi..."
                            className={inputClass('manufacturer')}
                        />
                        {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>}
                    </div>
                </div>

                {/* Đơn vị + Giá */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn vị <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className={inputClass('unit')}
                        >
                            <option value="">-- Chọn đơn vị --</option>
                            {UNITS.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                        {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá (đ) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            placeholder="VD: 2000"
                            className={inputClass('price')}
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                </div>

                {/* Tồn kho + Tối thiểu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng tồn kho <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="VD: 500"
                            className={inputClass('stock')}
                        />
                        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tồn kho tối thiểu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="minStock"
                            value={formData.minStock}
                            onChange={handleChange}
                            min="0"
                            placeholder="VD: 100"
                            className={inputClass('minStock')}
                        />
                        {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>}
                    </div>
                </div>

                {/* Số lô + HSD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lô
                        </label>
                        <input
                            type="text"
                            name="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleChange}
                            placeholder="VD: PCT-2024-001"
                            className={inputClass('batchNumber')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hạn sử dụng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className={inputClass('expiryDate')}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PharmacyMedicineModal;
