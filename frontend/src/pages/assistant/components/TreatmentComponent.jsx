import React, { useState } from "react";
import { Clock, Activity } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import treatmentApi from "../../../services/treatmentService";

import TreatmentDetailModal from "./../modals/treatment/TreatmentDetailModal"; 

const TreatmentComponent = ({ treatment, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleViewDetail = async () => {
    setIsModalOpen(true);
    
    // Nếu đã tải rồi thì không tải lại
    if (detailData) return; 

    setIsLoading(true);
    try {
      const response = await treatmentApi.viewTreatmentDetail(treatment._id);
      const dataToSet = response?.data?.data || response?.data || response;
      setDetailData(dataToSet);
    } catch (error) {
      console.error("Lỗi tải chi tiết điều trị:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Component dạng Thẻ (Card) */}
      <div
        onClick={handleViewDetail}
        className={`relative p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group ${
          treatment.status === "DONE" || treatment.status === "COMPLETED"
            ? "bg-green-50/40 border-green-200 hover:border-green-400"
            : "bg-blue-50/30 border-blue-100 hover:border-blue-400"
        }`}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-2xl transition-all"></div>

        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 border-slate-100 text-slate-600 text-xs flex items-center justify-center font-black shadow-md z-10 group-hover:scale-110 transition-transform">
          {index + 1}
        </div>

        <div className="flex justify-between items-start mb-2 relative z-10">
          <p className="text-base font-black text-slate-800">
            Răng: {treatment.tooth_position}
          </p>
          <Badge
            variant={treatment.status === "DONE" || treatment.status === "COMPLETED" ? "success" : "primary"}
            className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shadow-sm"
          >
            {treatment.status === "DONE" || treatment.status === "COMPLETED" ? "Hoàn thành" : "Kế hoạch"}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 mb-3 font-medium line-clamp-2 relative z-10">
          {treatment.note || "Không có ghi chú"}
        </p>

        <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
            <Clock size={14} className={treatment.status === "DONE" || treatment.status === "COMPLETED" ? "text-green-500" : "text-blue-500"} />
            {new Date(treatment.planned_date).toLocaleDateString("vi-VN")}
          </div>
          <p className="text-[10px] text-blue-600 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Activity size={12}/> Xem chi tiết
          </p>
        </div>
      </div>

      {/* SỬ DỤNG COMPONENT MODAL ĐÃ IMPORT */}
      <TreatmentDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={detailData} 
        isLoading={isLoading} 
      />
    </>
  );
};

export default TreatmentComponent;