import React, { useState, useEffect } from "react";
import { X, Save, Edit, Pill, Plus, AlertCircle, CheckCircle, Ban, HelpCircle, DollarSign } from "lucide-react";
import treatmentApi from "../../../../services/treatmentService";
import MedicineModal from "./medicineModal";

// Hàm tạo 1 object thuốc rỗng
const generateBlankMedicine = () => ({
  _localId: Date.now() + Math.random(),
  medicine_id: "",
  quantity: 1,
  usage_instruction: "",
  note: "",
});

const UpdateTreatmentModal = ({ isOpen, onClose, treatment, onSuccess }) => {
  const [submitType, setSubmitType] = useState(null);
  const [error, setError] = useState("");
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // State thông tin cơ bản - Đã thêm price
  const [formData, setFormData] = useState({ note: "", price: "" });
  const [medicines, setMedicines] = useState([]);

  // --- STATE QUẢN LÝ POPUP CONFIRM ---
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    btnText: "",
    btnColor: ""
  });

  // Khi mở modal: fetch chi tiết treatment
  useEffect(() => {
    if (!isOpen || !treatment) return;

    setError("");
    setSubmitType(null);
    setConfirmPopup({ isOpen: false });

    const loadFromDetail = async () => {
      setIsFetchingDetail(true);
      try {
        const response = await treatmentApi.viewTreatmentDetail(treatment._id);
        const detail = response?.data?.data || response?.data || response;
        
        // Cập nhật formData bao gồm note và price
        setFormData({ 
          note: detail.note || treatment.note || "",
          price: detail.price !== undefined ? detail.price : (treatment.price || 0)
        });

        if (detail.medicine_usage && detail.medicine_usage.length > 0) {
          const loadedMedicines = detail.medicine_usage.map((med) => ({
            ...med,
            _localId: med._id || Date.now() + Math.random(),
            medicine_id: med.medicine_id?._id || med.medicine_id || "",
            _medicine_name:
              med.medicine_id?.medicine_name ||
              med.medicine_id?.name ||
              "",
          }));
          setMedicines(loadedMedicines);
        } else {
          setMedicines([]);
        }
      } catch {
        // Fallback
        setFormData({ 
          note: treatment.note || "", 
          price: treatment.price || 0 
        });
        if (treatment.medicine_usage && treatment.medicine_usage.length > 0) {
          setMedicines(
            treatment.medicine_usage.map((med) => ({
              ...med,
              _localId: med._id || Date.now() + Math.random(),
              medicine_id: med.medicine_id?._id || med.medicine_id || "",
              _medicine_name:
                med.medicine_id?.medicine_name ||
                med.medicine_id?.name ||
                "",
            }))
          );
        } else {
          setMedicines([]);
        }
      } finally {
        setIsFetchingDetail(false);
      }
    };

    loadFromDetail();
  }, [isOpen, treatment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = () => setMedicines((prev) => [...prev, generateBlankMedicine()]);
  const handleRemoveMedicine = (localId) => setMedicines((prev) => prev.filter((m) => m._localId !== localId));
  const handleMedicineChange = (localId, field, value) => {
    setMedicines((prev) => prev.map((med) => med._localId === localId ? { ...med, [field]: value } : med));
  };

  const openConfirm = (type) => {
    let config = {};
    switch (type) {
      case 'CLOSE':
        config = { title: "Xác nhận đóng", message: "Bạn có chắc chắn muốn đóng? Những thay đổi chưa lưu sẽ bị mất.", btnText: "Đồng ý đóng", btnColor: "bg-slate-600 hover:bg-slate-700" };
        break;
      case 'CANCEL_TREATMENT':
        config = { title: "Hủy bỏ điều trị", message: "Bạn có chắc chắn muốn HỦY đợt điều trị này? Trạng thái sẽ được đổi thành Đã hủy (CANCELLED).", btnText: "Xác nhận Hủy", btnColor: "bg-red-500 hover:bg-red-600" };
        break;
      case 'UPDATE':
        config = { title: "Lưu cập nhật", message: "Xác nhận lưu lại các thông tin ghi chú, đơn thuốc và đơn giá?", btnText: "Xác nhận Lưu", btnColor: "bg-blue-600 hover:bg-blue-700" };
        break;
      case 'COMPLETE':
        config = { title: "Hoàn thành điều trị", message: "Xác nhận hoàn thành đợt điều trị này? Hồ sơ sẽ được chuyển sang trạng thái Chờ duyệt.", btnText: "Xác nhận Hoàn thành", btnColor: "bg-orange-500 hover:bg-orange-600" };
        break;
      default:
        return;
    }
    setConfirmPopup({ isOpen: true, type, ...config });
  };

  const handleConfirmYes = () => {
    const type = confirmPopup.type;
    setConfirmPopup({ ...confirmPopup, isOpen: false });
    if (type === 'CLOSE') {
      onClose();
    } else {
      executeSubmit(type);
    }
  };

  const executeSubmit = async (type) => {
    setSubmitType(type);
    setError("");

    try {
      // 1. Validate đơn giá
      const priceValue = Number(formData.price);
      if (formData.price === "" || isNaN(priceValue) || priceValue < 0) {
        throw new Error("Vui lòng nhập đơn giá hợp lệ (không được để trống).");
      }

      // 2. Validate thuốc
      for (let i = 0; i < medicines.length; i++) {
        if (!medicines[i].medicine_id) throw new Error(`Thuốc #${i + 1}: Vui lòng chọn loại thuốc.`);
      }

      const cleanMedicineUsage = medicines.map((med) => {
        const { _localId, _medicine_name, ...rest } = med;
        return { ...rest, quantity: Number(rest.quantity) };
      });

      let finalStatus = treatment.status;
      if (type === "COMPLETE") finalStatus = "WAITING_APPROVAL";
      if (type === "CANCEL_TREATMENT") finalStatus = "CANCELLED";

      const payload = {
        status: finalStatus,
        note: formData.note,
        price: priceValue, // Gửi price về body
        medicine_usage: cleanMedicineUsage,
      };

      await treatmentApi.updateTreatmentMedicine(treatment._id, payload);

      if (onSuccess) onSuccess(finalStatus);
      onClose();

    } catch (err) {
      console.error("Lỗi cập nhật phiếu điều trị:", err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitType(null);
    }
  };

  if (!isOpen || !treatment) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-orange-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-md shadow-orange-200">
                <Edit size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Cập nhật phiếu điều trị</h2>
                <p className="text-sm font-bold text-slate-500 mt-0.5">Vị trí: <span className="text-orange-600">{treatment.tooth_position}</span></p>
              </div>
            </div>
            <button onClick={() => openConfirm('CLOSE')} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
            {isFetchingDetail ? (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400">Đang tải dữ liệu chi tiết...</p>
              </div>
            ) : (
              <>
                {/* PHẦN 1: THÔNG TIN CHUNG */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <AlertCircle size={16} /> Thông tin điều trị & Chi phí
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* TRƯỜNG PRICE MỚI */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600 ml-1 flex items-center gap-1">
                         <DollarSign size={12} /> Đơn giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Nhập giá tiền..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold text-blue-600 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-slate-600 ml-1">Ghi chú của bác sĩ</label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows="1"
                        placeholder="Ghi nhận tình trạng bệnh nhân..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-orange-500 outline-none font-medium text-slate-700 transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* PHẦN 2: KÊ ĐƠN THUỐC */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill size={16} /> Đơn thuốc ({medicines.length})
                    </h3>
                    <button type="button" onClick={handleAddMedicine} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <Plus size={14} /> Kê thêm thuốc
                    </button>
                  </div>

                  {medicines.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-sm font-bold text-slate-400">
                      Chưa kê loại thuốc nào.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medicines.map((med) => (
                        <MedicineModal key={med._localId} med={med} handleMedicineChange={handleMedicineChange} handleRemoveMedicine={handleRemoveMedicine} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-3xl shrink-0">
            <button onClick={() => openConfirm('CLOSE')} disabled={submitType !== null} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
              Đóng
            </button>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <button onClick={() => openConfirm("CANCEL_TREATMENT")} disabled={submitType !== null} className="w-full md:w-auto px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex justify-center items-center gap-2 border border-red-100">
                {submitType === "CANCEL_TREATMENT" ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Ban size={18} />}
                Hủy điều trị
              </button>

              <button onClick={() => openConfirm("COMPLETE")} disabled={submitType !== null} className="w-full md:w-auto px-8 py-3 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-orange-200">
                {submitType === "COMPLETE" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle size={20} />}
                Hoàn thành
              </button>

              <button onClick={() => openConfirm("UPDATE")} disabled={submitType !== null} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-200">
                {submitType === "UPDATE" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                Lưu cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM POPUP */}
      {confirmPopup.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{confirmPopup.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-8">{confirmPopup.message}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfirmPopup({ isOpen: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Hủy</button>
              <button onClick={handleConfirmYes} className={`flex-1 py-3 text-white rounded-xl font-black ${confirmPopup.btnColor}`}>
                {confirmPopup.btnText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateTreatmentModal;