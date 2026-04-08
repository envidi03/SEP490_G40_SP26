import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, FileText, Search, Mail, Stethoscope, CheckCircle2, AlertCircle, X } from 'lucide-react';
import appointmentAPI from '../../../services/appointmentService';
import serviceAPI from '../../../services/serviceService';

const Booking = () => {
      const [services, setServices] = useState([]);
      const [subServices, setSubServices] = useState([]);

      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [successMessage, setSuccessMessage] = useState('');

      const [formData, setFormData] = useState({
            full_name: '',
            phone: '',
            email: '',
            appointment_date: '',
            appointment_time: '',
            doctor_id: '',
            reason: '',
            notes: '',
            book_service: [{
                  service_id: '',
                  sub_service_id: '',
                  unit_price: 0,
            }],
            priority: 2,
      });

      const fetchServices = async () => {
            try {
                  const res = await serviceAPI.getAllServices({ filter: 'AVAILABLE', limit: 100 });
                  if (res?.data) {
                        setServices(res.data);
                  }
            } catch (err) {
                  console.error("Lỗi lấy danh sách dịch vụ:", err);
            }
      };

      const fetchSubServices = async () => {
            const serviceId = formData.book_service[0].service_id;
            if (!serviceId) {
                  setSubServices([]);
                  return;
            }
            try {
                  const subRes = await serviceAPI.getSubServicesByParent(serviceId, { filter: 'AVAILABLE', limit: 100 });
                  if (subRes?.data) {
                        setSubServices(subRes.data);
                  }
            } catch (err) {
                  console.error("Lỗi lấy dịch vụ con:", err);
            }
      };

      useEffect(() => {
            fetchServices();
      }, []);

      useEffect(() => {
            fetchSubServices();
      }, [formData.book_service[0].service_id]);

      const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                  ...prev,
                  [name]: value
            }));
      };

      // ĐÃ SỬA LẠI LOGIC Ở ĐÂY
      const handleServiceChange = (e) => {
            const { name, value } = e.target;

            setFormData(prev => {
                  // Copy state hiện tại của book_service
                  let updatedBookService = {
                        ...prev.book_service[0],
                        [name]: value
                  };

                  // 1. NẾU ĐỔI DỊCH VỤ CON -> Tìm min_price để gán vào unit_price
                  if (name === 'sub_service_id') {
                        const selectedSub = subServices.find(sub => (sub.id || sub._id) === value);
                        updatedBookService.unit_price = selectedSub ? (selectedSub.min_price || 0) : 0;
                  }

                  // 2. NẾU ĐỔI DỊCH VỤ CHA -> Reset dịch vụ con và giá tiền
                  if (name === 'service_id') {
                        updatedBookService.sub_service_id = '';
                        updatedBookService.unit_price = 0;
                  }

                  return {
                        ...prev,
                        book_service: [updatedBookService]
                  };
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccessMessage('');

            try {
                  await appointmentAPI.staffCreateAppointment(formData);
                  setSuccessMessage("Đặt lịch hẹn thành công! Chúng tôi sẽ sớm liên hệ để xác nhận.");

                  setFormData({
                        full_name: '',
                        phone: '',
                        email: '',
                        appointment_date: '',
                        appointment_time: '',
                        doctor_id: '',
                        reason: '',
                        notes: '',
                        book_service: [{
                              service_id: '',
                              sub_service_id: '',
                              unit_price: 0,
                        }],
                        priority: 2,
                  });
            } catch (err) {
                  console.error("Lỗi tạo lịch hẹn:", err);
                  setError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo lịch hẹn. Vui lòng thử lại.");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Header */}
                        <div className="bg-primary-50 px-8 py-6 border-b border-primary-100">
                              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="p-2.5 bg-primary-600 text-white rounded-xl shadow-sm">
                                          <CalendarIcon size={24} />
                                    </div>
                                    Đăng Ký Khám Bệnh
                              </h2>
                              <p className="text-sm text-gray-600 mt-2 ml-14">
                                    Điền thông tin vào biểu mẫu dưới đây để đặt lịch hẹn tại phòng khám
                              </p>
                        </div>

                        <div className="p-8">
                              {/* POPUP MESSAGES */}
                              {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between">
                                          <div className="flex items-start gap-3">
                                                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                                                <div>
                                                      <h4 className="text-sm font-bold text-red-800">Đặt lịch thất bại</h4>
                                                      <p className="text-sm text-red-600 mt-1">{error}</p>
                                                </div>
                                          </div>
                                          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                                <X size={18} />
                                          </button>
                                    </div>
                              )}

                              {successMessage && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                                          <div className="flex items-start gap-3">
                                                <CheckCircle2 className="text-green-500 mt-0.5" size={20} />
                                                <div>
                                                      <h4 className="text-sm font-bold text-green-800">Thành công!</h4>
                                                      <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                                                </div>
                                          </div>
                                          <button onClick={() => setSuccessMessage('')} className="text-green-400 hover:text-green-600">
                                                <X size={18} />
                                          </button>
                                    </div>
                              )}

                              <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Khu vực 1: Thông tin bệnh nhân */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <User size={18} className="text-primary-600" />
                                                Thông tin liên hệ
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Họ và tên <span className="text-red-500">*</span>
                                                      </label>
                                                      <input
                                                            type="text"
                                                            name="full_name"
                                                            value={formData.full_name}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                            placeholder="Nguyễn Văn A"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Số điện thoại <span className="text-red-500">*</span>
                                                      </label>
                                                      <div className="relative">
                                                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                  type="tel"
                                                                  name="phone"
                                                                  value={formData.phone}
                                                                  onChange={handleChange}
                                                                  required
                                                                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                                  placeholder="0901234567"
                                                            />
                                                      </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email
                                                      </label>
                                                      <div className="relative">
                                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                  type="email"
                                                                  name="email"
                                                                  value={formData.email}
                                                                  onChange={handleChange}
                                                                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                                  placeholder="example@gmail.com"
                                                            />
                                                      </div>
                                                </div>
                                          </div>
                                    </div>

                                    {/* Khu vực 2: Dịch vụ & Thời gian */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          {/* Cột trái: Chọn Dịch vụ */}
                                          <div className="space-y-6">
                                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                                                      <Stethoscope size={18} className="text-primary-600" />
                                                      Dịch vụ chuyên môn
                                                </h3>

                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm Dịch Vụ</label>
                                                      <select
                                                            name="service_id"
                                                            value={formData.book_service[0].service_id}
                                                            onChange={handleServiceChange}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                      >
                                                            <option value="">-- Chọn nhóm dịch vụ --</option>
                                                            {services.map(srv => (
                                                                  <option key={srv.id || srv._id} value={srv.id || srv._id}>{srv.service_name || srv.name}</option>
                                                            ))}
                                                      </select>
                                                </div>

                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ chi tiết</label>
                                                      <select
                                                            name="sub_service_id"
                                                            value={formData.book_service[0].sub_service_id}
                                                            onChange={handleServiceChange}
                                                            disabled={!formData.book_service[0].service_id}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                                                      >
                                                            <option value="">-- Chọn dịch vụ --</option>
                                                            {subServices.map(sub => (
                                                                  <option key={sub.id || sub._id} value={sub.id || sub._id}>{sub.sub_service_name || sub.name}</option>
                                                            ))}
                                                      </select>

                                                      {/* Hiển thị giá tiền tạm tính cho người dùng thấy */}
                                                      {formData.book_service[0].unit_price > 0 && (
                                                            <p className="text-sm text-green-600 font-semibold mt-2 ml-1">
                                                                  Đơn giá tạm tính: {formData.book_service[0].unit_price.toLocaleString('vi-VN')} VNĐ
                                                            </p>
                                                      )}
                                                </div>

                                          </div>

                                          {/* Cột phải: Thời gian */}
                                          <div className="space-y-6">
                                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                                                      <Clock size={18} className="text-primary-600" />
                                                      Lịch hẹn
                                                </h3>

                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Ngày hẹn <span className="text-red-500">*</span>
                                                      </label>
                                                      <input
                                                            type="date"
                                                            name="appointment_date"
                                                            value={formData.appointment_date}
                                                            onChange={handleChange}
                                                            required
                                                            min={new Date().toISOString().split('T')[0]}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                      />
                                                </div>

                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Giờ hẹn <span className="text-red-500">*</span>
                                                      </label>
                                                      <input
                                                            type="time"
                                                            name="appointment_time"
                                                            value={formData.appointment_time}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                      />
                                                </div>
                                          </div>
                                    </div>

                                    {/* Khu vực 3: Lý do & Ghi chú */}
                                    <div className="space-y-6">
                                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                                                <FileText size={18} className="text-primary-600" />
                                                Chi tiết tình trạng
                                          </h3>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                      Lý do khám <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                      name="reason"
                                                      value={formData.reason}
                                                      onChange={handleChange}
                                                      required
                                                      rows={3}
                                                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                      placeholder="Vui lòng mô tả triệu chứng hoặc nhu cầu khám..."
                                                />
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                      Ghi chú thêm (Không bắt buộc)
                                                </label>
                                                <textarea
                                                      name="notes"
                                                      value={formData.notes}
                                                      onChange={handleChange}
                                                      rows={2}
                                                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                      placeholder="Dị ứng thuốc, yêu cầu đặc biệt..."
                                                />
                                          </div>
                                    </div>

                                    {/* Thông tin lưu ý */}
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                          <p className="text-sm text-blue-800 flex items-start gap-2">
                                                <span className="text-blue-600 font-bold">Lưu ý:</span>
                                                Quý khách vui lòng đến trước giờ hẹn 10 - 15 phút để bộ phận Lễ tân có thể chuẩn bị hồ sơ và tiếp đón chu đáo nhất.
                                          </p>
                                    </div>

                                    {/* Nút Submit */}
                                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                                          <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                          >
                                                {loading ? (
                                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                      <>
                                                            <CalendarIcon size={20} />
                                                            Xác Nhận Đặt Lịch
                                                      </>
                                                )}
                                          </button>
                                    </div>
                              </form>
                        </div>
                  </div>
            </div>
      );
};

export default Booking;