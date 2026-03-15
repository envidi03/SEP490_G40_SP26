import React from "react"
import Modal from "../../../components/ui/Modal"

const getStatusStyle = (status) => {
  const colorMap = {
    Confirmed: "bg-teal-50 text-teal-700 border-teal-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
    CHECKED_IN: "bg-purple-50 text-purple-700 border-purple-200"
  }
  return colorMap[status] || "bg-gray-50 text-gray-600 border-gray-200"
}

const AppointmentDetailModal = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null

  // Đảm bảo lấy đúng thông tin bệnh nhân từ cấp ngoài cùng hoặc qua populate
  const patientName = appointment.patient_id?.full_name || appointment.full_name || appointment.patientName || "Bệnh nhân không rõ"
  const patientPhone = appointment.patient_id?.phone || appointment.phone || appointment.patientPhone || "Không có SĐT"
  const dateStr = appointment.appointment_date
    ? new Date(appointment.appointment_date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })
    : appointment.date || "Chưa xác định"
  const timeStr = appointment.appointment_time || appointment.start_time || appointment.time || "Theo giờ hẹn"

  // Xử lý hiển thị thông tin dịch vụ
  let service = appointment.appointment_type || appointment.reason || "Khám định kỳ"
  if (appointment.book_service && appointment.book_service.length > 0 && appointment.book_service[0]?.service_id?.name) {
    service = appointment.book_service.map(s => s.service_id.name).join(', ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết lịch hẹn" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium">MÃ LỊCH HẸN</p>
            <p className="text-lg font-bold text-gray-800 mt-1 uppercase">
              {appointment._id?.slice(-6) || appointment.appointment_id || appointment.code || "---"}
            </p>
          </div>
          <span className={`px-3 py-1 text-[13px] font-medium rounded-full border ${getStatusStyle(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">Thông tin lịch khám</h3>

            <div className="space-y-4 text-[13px]">
              <div>
                <p className="text-gray-500 mb-1">Thời gian</p>
                <p className="font-semibold text-gray-800">{timeStr} — {dateStr}</p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Dịch vụ / Loại khám</p>
                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {service}
                </p>
              </div>

              {appointment.reason && appointment.reason !== service && (
                <div>
                  <p className="text-gray-500 mb-1">Lý do khám / Ghi chú</p>
                  <p className="font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 break-words">
                    {appointment.reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">Thông tin bệnh nhân</h3>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                <p className="font-bold text-gray-800 text-sm">{patientName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại liên lạc</p>
                <a href={`tel:${patientPhone}`} className="font-semibold text-teal-600 hover:text-teal-700 inline-block">
                  {patientPhone}
                </a>
              </div>

              {appointment.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày đặt lịch</p>
                  <p className="font-medium text-gray-700 text-[13px]">
                    {new Date(appointment.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AppointmentDetailModal
