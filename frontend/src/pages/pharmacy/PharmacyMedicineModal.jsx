import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Loader2 } from 'lucide-react';
import inventoryService from '../../services/inventoryService';

const INITIAL_FORM = {
    name: '',
    category: '',
    dosage: '',
    dosage_form: '',
    manufacturer: '',
    distributor: '',
    selling_unit: '',
    base_unit: '',
    price: '',
    stock: '',
    minStock: '',
    expiryDate: '',
    batchNumber: '',
    units_per_selling_unit: '1'
};




const PharmacyMedicineModal = ({ isOpen, onClose, onSubmit, editData = null, submitting = false }) => {
    const isEdit = !!editData;
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [dosageForms, setDosageForms] = useState([]);
    const [sellingUnits, setSellingUnits] = useState([]);
    const [baseUnits, setBaseUnits] = useState([]);

    // Lấy danh mục và các enum từ API
    useEffect(() => {
        inventoryService.getCategories()
            .then(res => {
                if (res?.success && res.data && res.data.length > 0) {
                    setCategories(res.data);
                } else {
                    // Fallback if API returns empty list
                    setCategories([
                        'Giảm đau - Hạ sốt', 'Kháng sinh', 'Kháng viêm', 'Thuốc gây tê',
                        'Vitamin & Khoáng chất', 'Kháng histamin', 'Dung dịch sát trùng',
                        'Vật liệu nha khoa', 'Khác'
                    ]);
                }
            });

        inventoryService.getDosageForms()
            .then(res => { if (res?.success) setDosageForms(res.data || []); })
            .catch(() => setDosageForms([]));

        inventoryService.getSellingUnits()
            .then(res => { if (res?.success) setSellingUnits(res.data || []); })
            .catch(() => setSellingUnits(['Viên', 'Vỉ', 'Hộp', 'Chai', 'Lọ', 'Tuýp', 'Gói', 'Ống', 'Bộ']));

        inventoryService.getBaseUnits()
            .then(res => { if (res?.success) setBaseUnits(res.data || []); })
            .catch(() => setBaseUnits(['Viên', 'ml', 'mg', 'Gói', 'Ống', 'Giọt']));
    }, []);

    // Khi mở modal, load dữ liệu vào form
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setFormData({
                    name: editData.name || '',
                    category: (typeof editData.category === 'object' && editData.category ? editData.category._id : editData.category) || '',
                    dosage: editData.dosage || '',
                    dosage_form: editData.dosage_form || '',
                    manufacturer: editData.manufacturer || '',
                    distributor: editData.distributor || '',
                    selling_unit: editData.selling_unit || '',
                    base_unit: editData.base_unit || '',
                    price: editData.price?.toString() || '',
                    stock: editData.stock?.toString() || '',
                    minStock: editData.minStock?.toString() || '',
                    expiryDate: editData.expiryDate || '',
                    batchNumber: editData.batchNumber || '',
                    units_per_selling_unit: editData.units_per_selling_unit?.toString() || '1'
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
        if (!formData.dosage_form) newErrors.dosage_form = 'Vui lòng chọn dạng bào chế';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Vui lòng nhập nhà sản xuất';
        if (!formData.selling_unit) newErrors.selling_unit = 'Vui lòng chọn đơn vị bán';
        if (!formData.base_unit) newErrors.base_unit = 'Vui lòng chọn đơn vị kê đơn';
        if (formData.price === '' || Number(formData.price) < 0) newErrors.price = 'Giá phải >= 0';
        if (formData.stock === '' || Number(formData.stock) < 0) newErrors.stock = 'Tồn kho phải >= 0';
        if (formData.minStock === '' || Number(formData.minStock) < 0) newErrors.minStock = 'Tồn kho tối thiểu phải >= 0';
        if (formData.units_per_selling_unit === '' || Number(formData.units_per_selling_unit) < 1) newErrors.units_per_selling_unit = 'Hệ số quy đổi phải >= 1';
        if (!formData.expiryDate) newErrors.expiryDate = 'Vui lòng chọn hạn sử dụng';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate() || submitting) return;
        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            minStock: Number(formData.minStock),
            ...(isEdit && { id: editData.id })
        };
        // Không gọi handleClose ở đây — để parent (PharmacyMedicines) đóng modal sau khi API thành công
        onSubmit(payload, isEdit);
    };

    const handleClose = () => {
        if (submitting) return; // Không cho đóng khi đang submit
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
                        disabled={submitting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
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

                {/* Danh mục + Dạng bào chế */}
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
                            {categories.map(cat => {
                                const id = typeof cat === 'object' ? cat._id : cat;
                                const name = typeof cat === 'object' ? cat.name : cat;
                                return (
                                    <option key={id} value={id}>{name}</option>
                                );
                            })}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dạng bào chế <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="dosage_form"
                            value={formData.dosage_form}
                            onChange={handleChange}
                            className={inputClass('dosage_form')}
                        >
                            <option value="">-- Chọn dạng bào chế --</option>
                            {dosageForms.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                        {errors.dosage_form && <p className="text-red-500 text-xs mt-1">{errors.dosage_form}</p>}
                    </div>
                </div>

                {/* NSX + Nhà phân phối */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nhà phân phối
                        </label>
                        <input
                            type="text"
                            name="distributor"
                            value={formData.distributor}
                            onChange={handleChange}
                            placeholder="VD: Công ty ABC..."
                            className={inputClass('distributor')}
                        />
                    </div>
                </div>

                {/* Đơn vị BÁN + Đơn vị KÊ ĐƠN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn vị Bán <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs text-gray-400 font-normal">(quản lý tồn kho)</span>
                        </label>
                        <select
                            name="selling_unit"
                            value={formData.selling_unit}
                            onChange={handleChange}
                            className={inputClass('selling_unit')}
                        >
                            <option value="">-- Chọn đơn vị bán --</option>
                            {sellingUnits.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                        {errors.selling_unit && <p className="text-red-500 text-xs mt-1">{errors.selling_unit}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn vị Kê Đơn <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs text-gray-400 font-normal">(bác sĩ kê đơn)</span>
                        </label>
                        <select
                            name="base_unit"
                            value={formData.base_unit}
                            onChange={handleChange}
                            className={inputClass('base_unit')}
                        >
                            <option value="">-- Chọn đơn vị kê đơn --</option>
                            {baseUnits.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                        {errors.base_unit && <p className="text-red-500 text-xs mt-1">{errors.base_unit}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quy đổi (1 {formData.selling_unit || 'ĐV Bán'} = ? {formData.base_unit || 'ĐV Cơ bản'}) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="units_per_selling_unit"
                            value={formData.units_per_selling_unit}
                            onChange={handleChange}
                            min="1"
                            placeholder="VD: 10"
                            className={inputClass('units_per_selling_unit')}
                        />
                        {errors.units_per_selling_unit && <p className="text-red-500 text-xs mt-1">{errors.units_per_selling_unit}</p>}
                    </div>
                </div>

                {/* Giá bán */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
