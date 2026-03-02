import { ClipboardCheck } from 'lucide-react'

const ApprovalHeader = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardCheck size={32} className="text-blue-600" />
            Phê duyệt Hồ sơ Nha khoa
        </h1>
        <p className="text-gray-600 mt-1">
            Xem xét và phê duyệt các hồ sơ do trợ lý/lễ tân tạo
        </p>
    </div>
)

export default ApprovalHeader
