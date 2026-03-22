import React from "react";
import {
  X,
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge"; 

const TreatmentDetailModal = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;

  // Format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
              <Stethoscope size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Chi tiết điều trị</h2>
              <p className="text-sm font-bold text-slate-400">Xem thông tin và đơn thuốc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Box 1: Thông tin tổng quan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vị trí răng</p>
                  <p className="text-lg font-black text-slate-800">{data.tooth_position}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giai đoạn</p>
                  <p className="text-lg font-black text-slate-800">{data.phase}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dự kiến thu</p>
                  <p className="text-lg font-black text-blue-600">{formatCurrency(data.planned_price)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <Badge variant={data.status === "DONE" || data.status === "COMPLETED" ? "success" : "primary"} className="mt-1 font-bold text-xs uppercase px-2 py-0.5">
                    {data.status === "DONE" || data.status === "COMPLETED" ? "Hoàn thành" : data.status}
                  </Badge>
                </div>
              </div>

              {/* Box 2: Thời gian & Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                   <div className="flex items-center gap-2 text-blue-600">
                     <Calendar size={18} />
                     <span className="font-black uppercase tracking-widest text-xs">Thời gian</span>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Dự kiến</p>
                     <p className="font-bold text-slate-700">{formatDate(data.planned_date)}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Thực hiện</p>
                     <p className="font-bold text-slate-700">{formatDate(data.performed_date)}</p>
                   </div>
                </div>

                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                   <div className="flex items-center gap-2 text-orange-500">
                     <FileText size={18} />
                     <span className="font-black uppercase tracking-widest text-xs">Mô tả / Ghi chú</span>
                   </div>
                   <p className="text-sm font-bold text-slate-600 leading-relaxed bg-white/50 p-3 rounded-xl border border-orange-100/50">
                     {data.note || "Không có ghi chú nào cho đợt điều trị này."}
                   </p>
                </div>
              </div>

              {/* Box 3: Đơn thuốc (Medicine Usage) */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-3 border-b-2 border-slate-50 pb-2">
                  <Pill size={20} className="text-green-500" />
                  Đơn thuốc kê toa
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-lg ml-2">
                    {data.medicine_usage?.length || 0} loại
                  </span>
                </h3>
                
                {data.medicine_usage && data.medicine_usage.length > 0 ? (
                  <div className="space-y-3">
                    {data.medicine_usage.map((med, i) => (
                      <div key={med._id || i} className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-colors flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-base">
                            {med.medicine_id?.medicine_name || "Tên thuốc ẩn"}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {med.medicine_id?.category} • {med.medicine_id?.dosage}
                          </p>
                          <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-blue-600"><span className="text-slate-400">HDSD:</span> {med.usage_instruction}</p>
                            {med.note && <p className="text-xs font-medium text-orange-500 mt-1 italic">* {med.note}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-start gap-2 min-w-[120px]">
                           <div className="text-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 w-full">
                              <p className="text-[10px] font-black text-blue-400 uppercase">Số lượng</p>
                              <p className="text-lg font-black text-blue-600">{med.quantity} <span className="text-xs">{med.medicine_id?.unit}</span></p>
                           </div>
                           {med.dispensed && (
                             <Badge variant="success" className="text-[9px] px-2 py-0.5 mt-1 font-bold w-full text-center">
                               <CheckCircle size={10} className="inline mr-1"/>Đã phát
                             </Badge>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-400">Bác sĩ chưa kê đơn thuốc cho đợt điều trị này.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold">Không tìm thấy dữ liệu chi tiết.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentDetailModal;