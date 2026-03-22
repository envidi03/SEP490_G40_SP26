import React from "react";
import { X, Stethoscope, Pill, Calendar, FileText, CheckCircle } from "lucide-react";
import Badge from "../../../../components/ui/Badge"; 
import { getStatusConfig } from "./getStatusConfig";



const TreatmentDetailModal = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Lấy cấu hình trạng thái hiện tại
  const currentStatus = data?.status || 'PLANNED';
  const statusConfig = getStatusConfig(currentStatus);
  const theme = statusConfig.modalTheme; // Trích xuất theme ra để code cho gọn

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* KHUNG MODAL */}
      <div 
        className={`bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-2 ${theme.border} ring-4 ${theme.ring}`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${theme.border} ${theme.headerBg}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 text-white rounded-2xl shadow-md ${theme.iconBg}`}>
                <Stethoscope size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Chi tiết điều trị</h2>
              <p className="text-sm font-bold text-slate-500 mt-0.5">Răng: <span className={theme.text}>{data?.tooth_position || "..."}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all active:scale-95">
              <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`animate-spin h-10 w-10 border-4 ${theme.text} border-t-transparent rounded-full mb-4`}></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Box 4 thông số */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 bg-slate-50 rounded-2xl border ${theme.border}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vị trí răng</p>
                  <p className="text-lg font-black text-slate-800">{data.tooth_position}</p>
                </div>
                <div className={`p-4 bg-slate-50 rounded-2xl border ${theme.border}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giai đoạn</p>
                  <p className="text-lg font-black text-slate-800">{data.phase}</p>
                </div>
                <div className={`p-4 bg-slate-50 rounded-2xl border ${theme.border}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dự kiến thu</p>
                  <p className={`text-lg font-black ${theme.text}`}>{formatCurrency(data.planned_price)}</p>
                </div>
                <div className={`p-4 bg-slate-50 rounded-2xl border ${theme.border}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <Badge variant={statusConfig.badgeVariant} className="mt-1 font-bold text-xs uppercase px-2 py-0.5" style={{ backgroundColor: statusConfig.badgeVariant === 'secondary' ? '#f3e8ff' : undefined, color: statusConfig.badgeVariant === 'secondary' ? '#9333ea' : undefined }}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Box Ngày tháng & Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                   <div className="flex items-center gap-2 text-slate-600"><Calendar size={18} /><span className="font-black uppercase tracking-widest text-xs">Thời gian</span></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase">Dự kiến</p><p className="font-bold text-slate-700">{formatDate(data.planned_date)}</p></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase">Thực hiện</p><p className="font-bold text-slate-700">{formatDate(data.performed_date)}</p></div>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                   <div className="flex items-center gap-2 text-slate-600"><FileText size={18} /><span className="font-black uppercase tracking-widest text-xs">Ghi chú của bác sĩ</span></div>
                   <p className="text-sm font-bold text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{data.note || "Không có ghi chú"}</p>
                </div>
              </div>

              {/* Box Đơn thuốc */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-3 border-b-2 border-slate-50 pb-2">
                  <Pill size={20} className={theme.text} /> Đơn thuốc kê toa <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-lg ml-2">{data.medicine_usage?.length || 0} loại</span>
                </h3>
                {data.medicine_usage && data.medicine_usage.length > 0 ? (
                  <div className="space-y-3">
                    {data.medicine_usage.map((med, i) => (
                      <div key={med._id || i} className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-col md:flex-row gap-4 justify-between hover:border-slate-300 transition-colors">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-base">{med.medicine_id?.medicine_name || "Tên thuốc"}</p>
                          <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-600"><span className="text-slate-400">HDSD:</span> {med.usage_instruction}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                           <div className="text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-full">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Số lượng</p>
                              <p className="text-lg font-black text-slate-700">{med.quantity} <span className="text-xs">{med.medicine_id?.unit}</span></p>
                           </div>
                           {med.dispensed && <Badge variant="success" className="text-[9px] px-2 py-0.5 mt-1 font-bold w-full text-center"><CheckCircle size={10} className="inline mr-1"/>Đã phát</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center text-sm font-bold text-slate-400">Bác sĩ chưa kê đơn thuốc cho đợt điều trị này.</div>
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