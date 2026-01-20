

import { X, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react"
import Badge from "../../../../components/ui/Badge"

const PatientDetailModal = ({ patient, doctorAppointments, onClose }) => {
  const patientAppointments = doctorAppointments.filter((apt) => apt.patient_id === patient.id)

  const calculateAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Thông tin bệnh nhân</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã bệnh nhân</p>
                <p className="text-lg font-bold text-gray-900">{patient.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge variant={patient.status === "active" ? "success" : "default"} className="mt-1">
                  {patient.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Tên đầy đủ</p>
                  <p className="text-gray-900 font-medium">{patient.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="text-gray-900 font-medium">
                    {patient.dob} ({calculateAge(patient.dob)} tuổi)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Giới tính</p>
                  <p className="text-gray-900 font-medium">{patient.gender}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="text-gray-900 font-medium">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <Mail size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="text-gray-900 font-medium">{patient.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch khám gần đây</h3>
            {patientAppointments.length > 0 ? (
              <div className="space-y-3">
                {patientAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {apt.date} - {apt.time}
                        </p>
                        <p className="text-sm text-gray-600">{apt.reason}</p>
                      </div>
                      <Badge
                        variant={
                          apt.status === "Completed" ? "success" : apt.status === "Confirmed" ? "info" : "warning"
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Không có lịch khám nào</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Tạo phiếu khám
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Xem hồ sơ y tế
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetailModal
