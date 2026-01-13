import { Users, Calendar, TrendingUp } from "lucide-react"
import Card from "../../../components/ui/Card"

const StatItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

const PatientStatsSection = ({ patients, doctorAppointments }) => {
  const totalPatients = patients.length
  const activePatients = patients.filter((p) => p.status === "active").length
  const appointmentsCount = doctorAppointments.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <StatItem icon={Users} label="Tổng bệnh nhân" value={totalPatients} color="bg-blue-500" />
      </Card>
      <Card>
        <StatItem icon={TrendingUp} label="Bệnh nhân hoạt động" value={activePatients} color="bg-green-500" />
      </Card>
      <Card>
        <StatItem icon={Calendar} label="Tổng lịch hẹn" value={appointmentsCount} color="bg-purple-500" />
      </Card>
    </div>
  )
}

export default PatientStatsSection
