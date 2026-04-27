import React, { useState, useEffect } from "react";
import { X, Save, FilePlus, AlertCircle, Plus, Trash2, Pill, DollarSign } from "lucide-react";
import treatmentApi from "../../../../services/treatmentService";
import appointmentApi from "../../../../services/appointmentService";
import MedicineModal from "./medicineModal"; 

// Hàm tạo 1 object thuốc rỗng
const generateBlankMedicine = () => ({
  _localId: Date.now() + Math.random(),
  medicine_id: "",
  _medicine_name: "",
  quantity: 1,
  usage_instruction: "",
  note: "",
});

// Hàm tạo 1 object form rỗng
const generateBlankForm = () => ({
  _localId: Date.now() + Math.random(),
  tooth_position: "",
  phase: "PLAN", 
  quantity: 1,
  price: "", // Để trống để bắt buộc nhập
  planned_date: new Date().toISOString().split("T")[0],
  note: "",
  medicine_usage: [], 
});

const AddTreatmentModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState([generateBlankForm()]);
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
      prevForms.map((form) => {
        if (form._localId === localId) {
          const updatedForm = { ...form, [name]: value };
          
          // Tự động set ngày hôm nay nếu chọn SESSION
          if (name === "phase" && value === "SESSION") {
            updatedForm.planned_date = new Date().toISOString().split("T")[0];
          }
          
          return updatedForm;
        }
        return form;
      }),
    );
  };

  const handleAddForm = () => {
    setForms((prev) => [...prev, generateBlankForm()]);
  };

  const handleRemoveForm = (localId) => {
    setForms((prev) => prev.filter((f) => f._localId !== localId));
  };

  // --- LOGIC QUẢN LÝ THUỐC ---
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

  const closeErrorPopup = () => {
    setErrorPopup({ isOpen: false, messages: [] });
  };

  // XỬ LÝ LƯU DỮ LIỆU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let errors = [];

    try {
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        if (!form.tooth_position.trim()) {
          errors.push(`Phiếu #${i + 1}: Vui lòng nhập vị trí răng.`);
        }
        const priceValue = Number(form.price);
        if (form.price === "" || isNaN(priceValue) || priceValue < 0) {
          errors.push(`Phiếu #${i + 1}: Vui lòng nhập đơn giá hợp lệ (lớn hơn hoặc bằng 0).`);
        }
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

      // 2. GỌI API
      let successCount = 0;
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        try {
          const { _localId, medicine_usage, ...dataToSend } = form;

          let cleanMedicineUsage = [];
          if (form.phase !== "PLAN" && medicine_usage.length > 0) {
            cleanMedicineUsage = medicine_usage.map((med) => {
              const { _localId, ...rest } = med;
              return { ...rest, quantity: Number(rest.quantity) };
            });
          }

          let doctorId = null;

          if (form.phase !== "PLAN") {
            try {
              const res = await appointmentApi.getDoctorIdFromAppointmentId(record.appointment_id);
              doctorId = res?.data || null;
            } catch (err) {
              doctorId = null;
              console.log("Error: ", err);
            }
          }

          const payload = {
            ...dataToSend,
            record_id: record._id,
            patient_id: record?.patient_id?._id || record?.patient_id,
            doctor_id: doctorId,
            status: form.phase === "PLAN" ? "PLANNED" : "IN_PROGRESS",
            quantity: Number(form.quantity),
            price: Number(form.price), 
          };

          if (form.phase !== "PLAN") {
            payload.medicine_usage = cleanMedicineUsage;
          }

          await treatmentApi.createTreatment(payload.record_id, payload);
          successCount++;
        } catch (apiError) {
          errors.push(`Lỗi tại Phiếu #${i + 1}: ${apiError.response?.data?.message || "Lỗi máy chủ."}`);
        }
      }

      if (errors.length > 0) {
        setErrorPopup({ isOpen: true, messages: errors });
        if (successCount > 0) onSuccess();
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.log(err);
      setErrorPopup({ isOpen: true, messages: ["Hệ thống gặp sự cố, vui lòng thử lại."] });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                <FilePlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Thêm phiếu điều trị</h2>
                <p className="text-sm font-bold text-slate-500">Hồ sơ: <span className="text-blue-600">{record.record_name}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
            {forms.map((form, index) => (
              <div key={form._localId} className="relative p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm">
                
                {/* Chỉ số phiếu */}
                <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                    Phiếu điều trị #{index + 1}
                  </h3>
                  {forms.length > 1 && (
                    <button onClick={() => handleRemoveForm(form._localId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <Trash2 size={14} /> Xóa phiếu
                    </button>
                  )}
                </div>

                {/* Grid 1: Răng & Phase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vị trí răng <span className="text-red-500">*</span></label>
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
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hình thức điều trị</label>
                    <select
                      name="phase"
                      value={form.phase}
                      onChange={(e) => handleChange(form._localId, e)}
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl focus:border-blue-500 outline-none font-bold cursor-pointer"
                    >
                      <option value="PLAN">Lên Kế hoạch</option>
                      <option value="SESSION">Thực thi (Làm ngay)</option>
                    </select>
                  </div>
                </div>

                {/* Grid 2: Ngày, Số lượng, Đơn giá */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {form.phase === "PLAN" ? "Ngày dự kiến" : "Ngày thực hiện (Cố định)"}
                    </label>
                    <input
                      type="date"
                      name="planned_date"
                      value={form.planned_date}
                      onChange={(e) => handleChange(form._localId, e)}
                      disabled={form.phase === "SESSION"}
                      className={`w-full px-4 py-3 border rounded-xl outline-none font-bold transition-all ${
                        form.phase === "SESSION" 
                        ? "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed" 
                        : "bg-white text-slate-700 border-slate-200 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng răng</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => handleChange(form._localId, e)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <DollarSign size={10} /> Đơn giá (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={form.price}
                      onChange={(e) => handleChange(form._localId, e)}
                      placeholder="Nhập giá..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-blue-600 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={(e) => handleChange(form._localId, e)}
                    rows="2"
                    placeholder="Nhập ghi chú chi tiết..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700 resize-none transition-colors"
                  ></textarea>
                </div>

                {/* Kê đơn thuốc */}
                {form.phase !== "PLAN" && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        <Pill size={14} className="text-orange-500" /> Kê đơn thuốc ({form.medicine_usage.length})
                      </h4>
                      <button type="button" onClick={() => handleAddMedicine(form._localId)} className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg text-[10px] font-black uppercase transition-colors">
                        <Plus size={12} strokeWidth={3} /> Kê thuốc
                      </button>
                    </div>

                    {form.medicine_usage.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center bg-white text-[11px] font-bold text-slate-400">
                        Chưa kê thuốc cho lần thực hiện này.
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
              </div>
            ))}

            <button onClick={handleAddForm} className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm transition-colors">
              <Plus size={20} strokeWidth={3} /> Thêm vị trí điều trị khác
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-3xl">
            <p className="text-sm font-bold text-slate-400">Tổng cộng: <span className="text-blue-600 text-xl mx-1">{forms.length}</span> phiếu</p>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95">Hủy bỏ</button>
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 active:scale-95">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
                Lưu {forms.length > 1 ? "tất cả" : ""}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Popup */}
      {errorPopup.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Thông tin chưa hợp lệ</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">Vui lòng kiểm tra lại các trường bắt buộc.</p>
            </div>
            <div className="p-6 bg-slate-50 max-h-[40vh] overflow-y-auto">
              <ul className="space-y-3">
                {errorPopup.messages.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-bold text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <span className="mt-0.5">•</span> {msg}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <button onClick={closeErrorPopup} className="w-full py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-colors">Quay lại hoàn thiện</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTreatmentModal;