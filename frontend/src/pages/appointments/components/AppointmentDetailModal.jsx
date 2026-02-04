"use client"
import { Phone, Calendar, Clock, FileText, AlertCircle } from "lucide-react"
import Modal from "../../../components/ui/Modal"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"

const AppointmentDetailModal = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null

  const getStatusColor = (status) => {
    const colorMap = {
      Confirmed: "success",
      Pending: "warning",
      Completed: "info",
      Cancelled: "danger",
    }
    return colorMap[status] || "default"
  }

  //   const calculateAge = (dob) => {
  //     const today = new Date()
  //     const birthDate = new Date(dob)
  //     let age = today.getFullYear() - birthDate.getFullYear()
  //     const monthDiff = today.getMonth() - birthDate.getMonth()
  //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  //       age--
  //     }
  //     return age
  //   }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết lịch hẹn" size="lg">
      <div className="space-y-6">
        {/* Appointment Status */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Mã lịch hẹn</p>
            <p className="text-lg font-bold text-gray-900">{appointment.code}</p>
          </div>
          <Badge variant={getStatusColor(appointment.status)} className="text-base px-3 py-1">
            {appointment.status}
          </Badge>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lịch hẹn</h3>

            <div className="flex items-start space-x-3">
              <Calendar size={20} className="text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày khám</p>
                <p className="text-gray-900 font-medium">{appointment.date}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock size={20} className="text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Giờ khám</p>
                <p className="text-gray-900 font-medium">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText size={20} className="text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Lý do khám</p>
                <p className="text-gray-900 font-medium">{appointment.reason}</p>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-orange-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="text-gray-900 font-medium">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bệnh nhân</h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên bệnh nhân</p>
                <p className="text-gray-900 font-medium">{appointment.patientName}</p>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <a href={`tel:${appointment.patientPhone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    {appointment.patientPhone}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Ngày tạo lịch</p>
                <p className="text-gray-900 font-medium">{appointment.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="primary" className="flex-1">
            Tạo hồ sơ nha khoa
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Xác nhận
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AppointmentDetailModal
