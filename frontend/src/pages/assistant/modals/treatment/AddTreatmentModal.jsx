import React, { useState, useEffect } from "react";
import { X, Save, FilePlus, AlertCircle, Plus, Trash2, Pill } from "lucide-react";
import treatmentApi from "../../../../services/treatmentService";
import MedicineModal from "./medicineModal"; // Import component dùng chung

// Hàm tạo 1 object thuốc rỗng
const generateBlankMedicine = () => ({
  _localId: Date.now() + Math.random(),
  medicine_id: "",
  quantity: 1,
  usage_instruction: "",
  note: "",
});

// Hàm tạo 1 object form rỗng (Đã bổ sung mảng medicine_usage)
const generateBlankForm = () => ({
  _localId: Date.now() + Math.random(),
  tooth_position: "",
  phase: "PLAN", // Mặc định là Lên Kế hoạch
  quantity: 1,
  planned_date: new Date().toISOString().split("T")[0],
  note: "",
  medicine_usage: [], // Khởi tạo mảng đơn thuốc rỗng cho mỗi phiếu
});

const AddTreatmentModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState([generateBlankForm()]);

  // STATE QUẢN LÝ POPUP LỖI
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, messages: [] });

  useEffect(() => {
    if (isOpen) {
      setForms([generateBlankForm()]);
      setErrorPopup({ isOpen: false, messages: [] });
    }
  }, [isOpen]);

  const handleChange = (localId, e) => {
    const { name, value } = e.target;
    setForms((prevForms) =>
      prevForms.map((form) =>
        form._localId === localId ? { ...form, [name]: value } : form,
      ),
    );
  };

  const handleAddForm = () => {
    setForms((prev) => [...prev, generateBlankForm()]);
  };

  const handleRemoveForm = (localId) => {
    setForms((prev) => prev.filter((f) => f._localId !== localId));
  };

  // --- LOGIC QUẢN LÝ THUỐC CHO TỪNG FORM ---
  const handleAddMedicine = (formLocalId) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form._localId === formLocalId
          ? { ...form, medicine_usage: [...form.medicine_usage, generateBlankMedicine()] }
          : form
      )
    );
  };

  const handleRemoveMedicine = (formLocalId, medicineLocalId) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form._localId === formLocalId
          ? { ...form, medicine_usage: form.medicine_usage.filter((m) => m._localId !== medicineLocalId) }
          : form
      )
    );
  };

  const handleMedicineChange = (formLocalId, medicineLocalId, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form._localId === formLocalId
          ? {
              ...form,
              medicine_usage: form.medicine_usage.map((med) =>
                med._localId === medicineLocalId ? { ...med, [field]: value } : med
              ),
            }
          : form
      )
    );
  };
  // -----------------------------------------

  // Đóng popup lỗi
  const closeErrorPopup = () => {
    setErrorPopup({ isOpen: false, messages: [] });
  };

  // XỬ LÝ SUBMIT NHIỀU FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let errors = [];

    try {
      // 1. VALIDATE VỊ TRÍ RĂNG VÀ THUỐC
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        if (!form.tooth_position.trim()) {
          errors.push(`Phiếu #${i + 1}: Vui lòng nhập vị trí răng điều trị.`);
        }
        
        // NẾU KHÔNG PHẢI PLAN, kiểm tra xem thuốc đã được chọn ID chưa
        if (form.phase !== "PLAN" && form.medicine_usage.length > 0) {
          for (let j = 0; j < form.medicine_usage.length; j++) {
            if (!form.medicine_usage[j].medicine_id) {
              errors.push(`Phiếu #${i + 1}: Thuốc số ${j + 1} chưa được chọn.`);
            }
          }
        }
      }

      if (errors.length > 0) {
        setErrorPopup({ isOpen: true, messages: errors });
        setLoading(false);
        return;
      }

      // 2. LẶP VÀ GỬI API TỪNG OBJECT
      let successCount = 0;
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        try {
          // Bỏ _localId và medicine_usage gốc ra khỏi data
          const { _localId, medicine_usage, ...dataToSend } = form;

          // Xử lý mảng thuốc (Loại bỏ _localId của thuốc)
          let cleanMedicineUsage = [];
          if (form.phase !== "PLAN" && medicine_usage.length > 0) {
            cleanMedicineUsage = medicine_usage.map((med) => {
              const { _localId, ...rest } = med;
              return { ...rest, quantity: Number(rest.quantity) };
            });
          }

          // Tạo payload
          const payload = {
            ...dataToSend,
            record_id: record._id,
            patient_id: record?.patient_id?._id || record?.patient_id, 
            doctor_id: record?.doctor_info?._id || record?.doctor_id,
            status: form.phase === "PLAN" ? "PLANNED" : "IN_PROGRESS",
          };

          // Nếu là SESSION (Thực thi), đính kèm mảng thuốc vào payload
          if (form.phase !== "PLAN") {
             payload.medicine_usage = cleanMedicineUsage;
          }

          payload.quantity = Number(payload.quantity);

          // Gọi API đẩy về Backend
          await treatmentApi.createTreatment(payload.record_id, payload);
          successCount++;
        } catch (apiError) {
          console.error("API Error ở phiếu", i + 1, apiError);
          const errorMsg =
            apiError.response?.data?.message ||
            apiError.message ||
            "Lỗi hệ thống không xác định.";
          errors.push(`Lỗi máy chủ tại Phiếu #${i + 1}: ${errorMsg}`);
        }
      }

      // 3. KẾT QUẢ
      if (errors.length > 0) {
        setErrorPopup({ isOpen: true, messages: errors });
        if (successCount > 0) onSuccess();
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi catch catch-all:", err);
      setErrorPopup({
        isOpen: true,
        messages: ["Đã có lỗi hệ thống xảy ra, vui lòng thử lại."],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Header --- */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200">
                <FilePlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Thêm nhiều phiếu điều trị
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-0.5">
                  Hồ sơ:{" "}
                  <span className="text-blue-600">{record.record_name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </div>

          {/* --- Form Body --- */}
          <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
            {forms.map((form, index) => (
              <div
                key={form._localId}
                className="relative p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm"
              >
                {/* Tiêu đề & Nút Xóa Form */}
                <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">
                      {index + 1}
                    </span>
                    Phiếu điều trị #{index + 1}
                  </h3>

                  {forms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveForm(form._localId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Trash2 size={14} /> Xóa phiếu
                    </button>
                  )}
                </div>

                {/* Hàng 1: Răng & Hình thức */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Vị trí răng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tooth_position"
                      value={form.tooth_position}
                      onChange={(e) => handleChange(form._localId, e)}
                      placeholder="VD: Răng 18, Toàn hàm..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Hình thức điều trị
                    </label>
                    <select
                      name="phase"
                      value={form.phase}
                      onChange={(e) => handleChange(form._localId, e)}
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl focus:border-blue-500 outline-none font-bold cursor-pointer appearance-none"
                    >
                      <option value="PLAN">Lên Kế hoạch</option>
                      <option value="SESSION">Thực thi (Làm ngay)</option>
                    </select>
                  </div>
                </div>

                {/* Hàng 2: Thời gian, Số lượng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {form.phase === "PLAN"
                        ? "Ngày dự kiến"
                        : "Ngày thực hiện"}
                    </label>
                    <input
                      type="date"
                      name="planned_date"
                      value={form.planned_date}
                      onChange={(e) => handleChange(form._localId, e)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Số lượng răng điều trị
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => handleChange(form._localId, e)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Hàng 3: Ghi chú */}
                <div className="space-y-2 mb-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Ghi chú / Mô tả
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={(e) => handleChange(form._localId, e)}
                    rows="2"
                    placeholder="Nhập ghi chú chi tiết..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700 transition-colors resize-none"
                  ></textarea>
                </div>

                {/* HÀNG 4: KÊ ĐƠN THUỐC (CHỈ HIỆN KHI LÀ SESSION) */}
                {form.phase !== "PLAN" && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        <Pill size={14} className="text-orange-500" /> Kê đơn thuốc ({form.medicine_usage.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleAddMedicine(form._localId)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg text-[10px] font-black transition-colors uppercase"
                      >
                        <Plus size={12} strokeWidth={3} /> Kê thuốc
                      </button>
                    </div>

                    {form.medicine_usage.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center bg-white">
                        <p className="text-[11px] font-bold text-slate-400">Chưa kê thuốc cho phiếu này.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.medicine_usage.map((med) => (
                          <MedicineModal
                            key={med._localId}
                            med={med}
                            handleMedicineChange={(medLocalId, field, value) => handleMedicineChange(form._localId, medLocalId, field, value)}
                            handleRemoveMedicine={(medLocalId) => handleRemoveMedicine(form._localId, medLocalId)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* ----------------------------------------------- */}
              </div>
            ))}

            {/* NÚT TẠO THÊM FORM */}
            <button
              type="button"
              onClick={handleAddForm}
              className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-sm"
            >
              <Plus size={20} strokeWidth={3} /> Thêm vị trí điều trị khác
            </button>
          </div>

          {/* --- Footer --- */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-3xl">
            <p className="text-sm font-bold text-slate-400">
              Tổng cộng:{" "}
              <span className="text-blue-600 text-xl mx-1">{forms.length}</span>{" "}
              phiếu
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:active:scale-100 active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={20} />
                )}
                Lưu {forms.length > 1 ? "tất cả" : ""}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- POPUP HIỂN THỊ LỖI TRƯỚC MẶT --- */}
      {errorPopup.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Opps! Đã có lỗi xảy ra
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Hệ thống phát hiện một vài vấn đề trong phiếu điều trị của bạn.
              </p>
            </div>

            <div className="p-6 bg-slate-50 max-h-[40vh] overflow-y-auto">
              <ul className="space-y-3">
                {errorPopup.messages.map((msg, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm font-bold text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100"
                  >
                    <span className="mt-0.5">•</span>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-center bg-white">
              <button
                onClick={closeErrorPopup}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-colors active:scale-95"
              >
                Tôi đã hiểu, Quay lại sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTreatmentModal;