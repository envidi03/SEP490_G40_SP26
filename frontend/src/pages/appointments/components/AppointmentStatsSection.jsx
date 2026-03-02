import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Card from "../../../components/ui/Card"

const StatCard = ({ icon: Icon, title, value, color }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </Card>
)

const AppointmentStatsSection = ({ appointments }) => {
  const stats = [
    {
      icon: Calendar,
      title: "Tổng lịch hẹn",
      value: appointments.length,
      color: "bg-blue-500",
    },
    {
      icon: AlertCircle,
      title: "Chờ xác nhận",
      value: appointments.filter((a) => a.status === "Pending").length,
      color: "bg-yellow-500",
    },
    {
      icon: CheckCircle,
      title: "Đã xác nhận",
      value: appointments.filter((a) => a.status === "Confirmed").length,
      color: "bg-green-500",
    },
    {
      icon: Clock,
      title: "Hoàn thành",
      value: appointments.filter((a) => a.status === "Completed").length,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

export default AppointmentStatsSection
