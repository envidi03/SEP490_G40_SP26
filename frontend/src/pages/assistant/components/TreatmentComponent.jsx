import React, { useState } from "react";
import { Clock, Activity, Play, Edit, Pill } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import treatmentApi from "../../../services/treatmentService";
import TreatmentDetailModal from "./../modals/treatment/TreatmentDetailModal";
import UpdateTreatmentModal from "./../modals/treatment/UpdateTreatmentModal";
import { getStatusConfig } from "../modals/treatment/getStatusConfig";

const TreatmentComponent = ({ treatment, index, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [localStatus, setLocalStatus] = useState(treatment.status);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const statusConfig = getStatusConfig(localStatus);

  const handleViewDetail = async () => {
    setIsModalOpen(true);
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

  const handleStartTreatment = async (e) => {
    e.stopPropagation();
    setIsChangingStatus(true);
    try {
      await treatmentApi.changeStatusTreatment(treatment._id, { status: "IN_PROGRESS" });
      setLocalStatus("IN_PROGRESS");
    } catch (error) {
      console.error("Lỗi:", error);
      alert(error.response?.data?.message || "Lỗi cập nhật trạng thái!");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleOpenUpdate = (e) => {
    e.stopPropagation();
    setShowUpdateModal(true);
  };

  // Danh sách các trạng thái KHÔNG cho phép cập nhật
  const restrictedStatuses = ['APPROVED', 'REJECTED', 'DONE', 'CANCELLED'];
  const canUpdate = !restrictedStatuses.includes(localStatus);

  const meds = treatment.medicine_usage || [];

  return (
    <div className="w-full h-full">
      <div
        onClick={handleViewDetail}
        className={`relative p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group flex flex-col justify-between h-full ${statusConfig.cardClass}`}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-2xl transition-all"></div>
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 border-slate-100 text-slate-600 text-xs flex items-center justify-center font-black shadow-md z-10 group-hover:scale-110 transition-transform">
          {index + 1}
        </div>

        <div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-base font-black text-slate-800">Răng: {treatment.tooth_position}</p>
            <Badge variant={statusConfig.badgeVariant} className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shadow-sm">
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-3 font-medium line-clamp-2 relative z-10">
            {treatment.note || "Không có ghi chú"}
          </p>

          {meds.length > 0 && (
            <div className="flex items-center gap-1.5 relative z-10 mb-2">
              <Pill size={12} className="text-orange-500" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                {meds.length} loại thuốc
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 relative z-10 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
            <Clock size={14} className={statusConfig.iconColor} />
            {new Date(treatment.planned_date).toLocaleDateString("vi-VN")}
          </div>

          <div className="flex items-center gap-2">
            {/* Logic hiển thị nút Cập nhật dựa trên canUpdate */}
            {canUpdate && (
              <button 
                onClick={handleOpenUpdate} 
                className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-orange-600 transition-colors shadow-sm active:scale-95"
              >
                <Edit size={10} /> CẬP NHẬT
              </button>
            )}

            {/* ĐÃ SỬA: Thêm điều kiện treatment.appointment_id vào đây */}
            {localStatus === 'PLANNED' && treatment.appointment_id && (
              <button 
                onClick={handleStartTreatment} 
                disabled={isChangingStatus} 
                className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isChangingStatus ? "..." : <Play size={10} fill="currentColor" />} BẮT ĐẦU
              </button>
            )}
          </div>
        </div>
      </div>

      <TreatmentDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={detailData} isLoading={isLoading} />

      <UpdateTreatmentModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        treatment={treatment}
        onSuccess={(newStatus) => {
          setLocalStatus(newStatus);
          setDetailData(null);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default TreatmentComponent;