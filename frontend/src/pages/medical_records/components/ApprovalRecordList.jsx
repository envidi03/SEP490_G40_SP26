import { ClipboardCheck } from 'lucide-react'
import Card from '../../../components/ui/Card'
import ApprovalRecordCard from './ApprovalRecordCard'

const ApprovalRecordList = ({ records, onApprove, onReject }) => {
    if (records.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <ClipboardCheck size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Không có hồ sơ nào cần phê duyệt</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {records.map(record => (
                <ApprovalRecordCard
                    key={record.id}
                    record={record}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            ))}
        </div>
    )
}

export default ApprovalRecordList
