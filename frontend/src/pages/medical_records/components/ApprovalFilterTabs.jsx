import Card from '../../../components/ui/Card'

const Tab = ({ active, onClick, children, activeClass }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${active ? activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
    >
        {children}
    </button>
)

const ApprovalFilterTabs = ({ filter, stats, onChange }) => (
    <Card>
        <div className="flex gap-2">
            <Tab active={filter === 'ALL'} activeClass="bg-blue-600 text-white" onClick={() => onChange('ALL')}>
                Tất cả ({stats.total})
            </Tab>

            <Tab active={filter === 'PENDING'} activeClass="bg-yellow-600 text-white" onClick={() => onChange('PENDING')}>
                Chờ duyệt ({stats.pending})
            </Tab>

            <Tab active={filter === 'REVIEWED'} activeClass="bg-blue-600 text-white" onClick={() => onChange('REVIEWED')}>
                Đã xem xét ({stats.approved + stats.rejected})
            </Tab>
        </div>
    </Card>
)

export default ApprovalFilterTabs
