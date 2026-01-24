import { useState } from "react"
import { mockPatients, mockAppointments } from "../../utils/mockData"
import { useAuth } from "../../contexts/AuthContext"
import PatientSearchBar from "./components/dentist/PatientSearchBar"
import PatientStatsSection from "./components/dentist/PatientStatsSection"
import PatientTableSection from "./components/dentist/PatientTableSection"
import PatientDetailModal from "./components/dentist/PatientDetailModal"

const DentistPatientList = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const doctorAppointments = mockAppointments.filter((apt) => apt.doctor_id === user?.id)
  const patientIds = new Set(doctorAppointments.map((apt) => apt.patient_id))

  // Get patients who have appointments with this doctor
  const doctorPatients = mockPatients.filter((p) => patientIds.has(p.id))

  // Filter patients based on search and status
  const filteredPatients = doctorPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.code.includes(searchTerm)

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && patient.status === filterStatus
  })

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPatient(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Danh sách Bệnh nhân</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin bệnh nhân của bạn</p>
      </div>

      {/* Patient Stats */}
      <PatientStatsSection patients={doctorPatients} doctorAppointments={doctorAppointments} />

      {/* Search and Filter */}
      <PatientSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {/* Patient Table */}
      <PatientTableSection patients={filteredPatients} onViewPatient={handleViewPatient} />

      {/* Patient Detail Modal */}
      {isModalOpen && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          doctorAppointments={doctorAppointments}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default DentistPatientList
