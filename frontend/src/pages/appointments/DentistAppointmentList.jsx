

import { useState, useMemo } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { getAppointmentsByDoctor } from "../../utils/mockData"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Table from "../../components/ui/Table"
import { Calendar } from "lucide-react"
import AppointmentSearchBar from "./components/AppointmentSearchBar"
import AppointmentStatsSection from "./components/AppointmentStatsSection"
import AppointmentDetailModal from "./components/AppointmentDetailModal"
import AppointmentStatusFilter from "./components/AppointmentStatusFilter"

const DentistAppointmentList = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Debug logging
  console.log('🔍 DentistAppointmentList - User:', user);
  console.log('🔍 User ID:', user?.id);

  const doctorAppointments = getAppointmentsByDoctor(user?.id)
  console.log('📅 Doctor Appointments:', doctorAppointments);
  console.log('📊 Total appointments found:', doctorAppointments.length);

  const filteredAppointments = useMemo(() => {
    return doctorAppointments.filter((apt) => {
      const matchesSearch =
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone.includes(searchTerm) ||
        apt.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || apt.status === statusFilter
      const matchesDate = !dateFilter || apt.date === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [doctorAppointments, searchTerm, statusFilter, dateFilter])

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  const tableColumns = [
    {
      header: "Mã LH",
      accessor: "code",
    },
    {
      header: "Bệnh nhân",
      accessor: "patientName",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.patientName}</p>
          <p className="text-sm text-gray-600">{row.patientPhone}</p>
        </div>
      ),
    },
    {
      header: "Ngày giờ",
      accessor: "date",
      render: (row) => (
        <div className="flex items-center">
          <Calendar size={16} className="text-gray-400 mr-2" />
          <div>
            <p className="font-medium text-gray-900">{row.date}</p>
            <p className="text-sm text-gray-600">{row.time}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Lý do khám",
      accessor: "reason",
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => {
        const variantMap = {
          Confirmed: "success",
          Pending: "warning",
          Completed: "info",
          Cancelled: "danger",
        }
        return <Badge variant={variantMap[row.status]}>{row.status}</Badge>
      },
    },
    {
      header: "Thao tác",
      render: (row) => (
        <button onClick={() => handleViewDetail(row)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          Chi tiết →
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lịch Hẹn Của Tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý và theo dõi lịch khám của bệnh nhân</p>
      </div>

      {/* Stats Section */}
      <AppointmentStatsSection appointments={filteredAppointments} />

      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <AppointmentSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <AppointmentStatusFilter statusFilter={statusFilter} onStatusChange={setStatusFilter} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo ngày</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("All")
                  setDateFilter("")
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card
        title={`Danh sách lịch hẹn (${filteredAppointments.length})`}
        actions={<Badge variant="info">{filteredAppointments.length} lịch hẹn</Badge>}
      >
        <Table columns={tableColumns} data={filteredAppointments} onRowClick={handleViewDetail} />
      </Card>

      {/* Detail Modal */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  )
}

export default DentistAppointmentList
