import { AlertCircle, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react'
import Card from '../../../components/ui/Card'

const StatCard = ({ label, value, icon: Icon, className }) => (
    <Card className={className}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <Icon size={40} />
        </div>
    </Card>
)

const ApprovalStats = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng số" value={stats.total} icon={AlertCircle}
            className="bg-blue-50 text-blue-700" />

        <StatCard label="Chờ duyệt" value={stats.pending} icon={ClipboardCheck}
            className="bg-yellow-50 text-yellow-700" />

        <StatCard label="Đã duyệt" value={stats.approved} icon={CheckCircle}
            className="bg-green-50 text-green-700" />

        <StatCard label="Từ chối" value={stats.rejected} icon={XCircle}
            className="bg-red-50 text-red-700" />
    </div>
)

export default ApprovalStats
