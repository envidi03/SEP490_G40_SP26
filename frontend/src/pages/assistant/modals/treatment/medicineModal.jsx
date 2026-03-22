import React from "react";
import { Trash2 } from "lucide-react";

const MedicineModal = ({ med, handleMedicineChange, handleRemoveMedicine }) => {
  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative">
      <button
        type="button"
        onClick={() => handleRemoveMedicine(med._localId)}
        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
        title="Xóa thuốc"
      >
        <Trash2 size={14} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thuốc <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={med.medicine_id}
            onChange={(e) => handleMedicineChange(med._localId, "medicine_id", e.target.value)}
            placeholder="Nhập ID Thuốc (Tạm thời do chưa gọi API List Thuốc)"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 text-sm"
          />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="1"
            value={med.quantity}
            onChange={(e) => handleMedicineChange(med._localId, "quantity", e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 text-sm"
          />
        </div>

        <div className="md:col-span-12 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hướng dẫn uống</label>
          <input
            type="text"
            value={med.usage_instruction}
            onChange={(e) => handleMedicineChange(med._localId, "usage_instruction", e.target.value)}
            placeholder="VD: Ngày uống 2 lần, mỗi lần 1 viên sau ăn..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicineModal;