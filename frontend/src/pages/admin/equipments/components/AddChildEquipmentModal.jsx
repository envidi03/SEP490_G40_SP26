import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const AddChildEquipmentModal = ({
      show,
      category, // Nhận thông tin danh mục hiện tại (VD: { _id: '...', equipment_type: 'X-Ray' })
      onSave,
      onClose
}) => {
      // Khởi tạo state chứa mảng các thiết bị con sẽ thêm
      const [equipmentList, setEquipmentList] = useState([]);

      // State quản lý thông báo lỗi validate
      const [errorMessage, setErrorMessage] = useState('');

      // Khi mở modal, tự động tạo sẵn 1 form trống
      useEffect(() => {
            if (show) {
                  setEquipmentList([{
                        equipment_name: '',
                        equipment_serial_number: '',
                        purchase_date: '',
                        supplier: '',
                        warranty: '',
                        status: 'READY'
                  }]);
                  // Reset lỗi khi mở lại modal
                  setErrorMessage('');
            }
      }, [show]);

      if (!show || !category) return null;

      const updateEquipmentDetail = (index, field, value) => {
            // Tự động xóa dòng báo lỗi khi người dùng bắt đầu gõ
            if (errorMessage) setErrorMessage('');

            const updatedList = [...equipmentList];
            updatedList[index] = {
                  ...updatedList[index],
                  [field]: value
            };
            setEquipmentList(updatedList);
      };

      const handleAddDetail = () => {
            setEquipmentList([
                  ...equipmentList,
                  {
                        equipment_name: '',
                        equipment_serial_number: '',
                        purchase_date: '',
                        supplier: '',
                        warranty: '',
                        status: 'READY'
                  }
            ]);
      };

      const handleRemoveDetail = (indexToRemove) => {
            setEquipmentList(equipmentList.filter((_, index) => index !== indexToRemove));
            // Cập nhật lại lỗi nếu xóa đúng cái form đang bị lỗi
            if (errorMessage) setErrorMessage('');
      };

      const handleSubmit = () => {
            // Validate dữ liệu trước khi lưu
            let hasError = false;
            for (let i = 0; i < equipmentList.length; i++) {
                  const device = equipmentList[i];

                  // Kiểm tra Tên thiết bị
                  if (!device.equipment_name.trim()) {
                        setErrorMessage(`❌ Vui lòng nhập Tên thiết bị ở Máy #${i + 1}`);
                        hasError = true;
                        break;
                  }

                  // Kiểm tra Số serial
                  if (!device.equipment_serial_number.trim()) {
                        setErrorMessage(`❌ Vui lòng nhập Số serial ở Máy #${i + 1}`);
                        hasError = true;
                        break;
                  }

                  // Kiểm tra Nhà cung cấp
                  if (!device.supplier.trim()) {
                        setErrorMessage(`❌ Vui lòng nhập Nhà cung cấp ở Máy #${i + 1}`);
                        hasError = true;
                        break;
                  }

                  // THÊM: Kiểm tra Hạn bảo hành
                  if (!device.warranty) {
                        setErrorMessage(`❌ Vui lòng chọn Hạn bảo hành ở Máy #${i + 1}`);
                        hasError = true;
                        break;
                  }
            }

            // Nếu có lỗi thì dừng lại không gọi API
            if (hasError) return;

            // Gửi mảng thiết bị và ID của danh mục lên cho component cha xử lý API
            onSave(category._id || category.id, equipmentList);
      };

      return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" onClick={onClose} />
                  <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all flex flex-col max-h-[90vh]">

                              {/* Header */}
                              <div className="shrink-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-t-2xl p-6 z-10">
                                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                                          <X size={24} />
                                    </button>
                                    <h2 className="text-2xl font-bold pr-8">
                                          Thêm máy mới vào: {category.equipment_type}
                                    </h2>
                                    <p className="text-emerald-100 mt-1">
                                          Điền thông tin các thiết bị chi tiết để bổ sung vào danh mục này
                                    </p>
                              </div>

                              {/* Hiển thị cảnh báo lỗi nếu validate fail */}
                              {errorMessage && (
                                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold flex items-center shadow-sm">
                                          {errorMessage}
                                    </div>
                              )}

                              {/* Form Body */}
                              <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-gray-50/50">
                                    {equipmentList.map((device, index) => (
                                          <div key={index} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm relative group hover:border-emerald-300 transition-all">

                                                {equipmentList.length > 1 && (
                                                      <button
                                                            onClick={() => handleRemoveDetail(index)}
                                                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                      >
                                                            <Trash2 size={18} />
                                                      </button>
                                                )}

                                                <h4 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                                                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                                                            {index + 1}
                                                      </div>
                                                      Máy #{index + 1}
                                                </h4>

                                                <div className="space-y-4 pr-8">
                                                      <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Tên thiết bị <span className="text-red-500">*</span>
                                                                  </label>
                                                                  <input
                                                                        type="text"
                                                                        value={device.equipment_name}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'equipment_name', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                  />
                                                            </div>
                                                            <div>
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Số serial <span className="text-red-500">*</span>
                                                                  </label>
                                                                  <input
                                                                        type="text"
                                                                        value={device.equipment_serial_number}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'equipment_serial_number', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                  />
                                                            </div>
                                                      </div>

                                                      <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày mua</label>
                                                                  <input
                                                                        type="date"
                                                                        value={device.purchase_date}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'purchase_date', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                  />
                                                            </div>
                                                            <div>
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Nhà cung cấp <span className="text-red-500">*</span>
                                                                  </label>
                                                                  <input
                                                                        type="text"
                                                                        value={device.supplier}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'supplier', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                  />
                                                            </div>
                                                      </div>

                                                      <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                  {/* THÊM: Dấu sao đỏ cho Hạn bảo hành */}
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Hạn bảo hành <span className="text-red-500">*</span>
                                                                  </label>
                                                                  <input
                                                                        type="date"
                                                                        value={device.warranty}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'warranty', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                  />
                                                            </div>
                                                            <div>
                                                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Tình trạng <span className="text-red-500">*</span>
                                                                  </label>
                                                                  <select
                                                                        value={device.status}
                                                                        onChange={(e) => updateEquipmentDetail(index, 'status', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                                  >
                                                                        <option value="READY">Sẵn sàng</option>
                                                                        <option value="IN_USE">Đang sử dụng</option>
                                                                        <option value="MAINTENANCE">Bảo trì</option>
                                                                        <option value="REPAIRING">Đang sửa chữa</option>
                                                                        <option value="FAULTY">Bị hỏng</option>
                                                                        <option value="STERILIZING">Đang khử trùng</option>
                                                                  </select>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    ))}

                                    <button
                                          onClick={handleAddDetail}
                                          className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 font-semibold hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                                    >
                                          <Plus size={20} />
                                          Thêm máy / chi tiết thiết bị mới
                                    </button>
                              </div>

                              {/* Footer */}
                              <div className="shrink-0 bg-white px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                                          Hủy
                                    </button>
                                    <button onClick={handleSubmit} className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-md">
                                          Lưu danh sách máy
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default AddChildEquipmentModal;