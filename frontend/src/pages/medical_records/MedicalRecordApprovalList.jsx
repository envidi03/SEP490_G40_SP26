import { useState, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMedicalRecordsPendingApproval } from '../../utils/mockData'

import ApprovalHeader from './components/ApprovalHeader'
import ApprovalStats from './components/ApprovalStats'
import ApprovalFilterTabs from './components/ApprovalFilterTabs'
import ApprovalRecordList from './components/ApprovalRecordList'

const MedicalRecordApprovalList = () => {
    const { user } = useAuth()

    const [records, setRecords] = useState(() =>
        getMedicalRecordsPendingApproval(user?.id || '')
    )
    const [filter, setFilter] = useState('ALL')

    const filteredRecords = useMemo(() => {
        if (filter === 'ALL') return records
        if (filter === 'PENDING') return records.filter(r => r.status === 'PENDING')
        return records.filter(r => r.status !== 'PENDING')
    }, [records, filter])

    const stats = useMemo(() => ({
        total: records.length,
        pending: records.filter(r => r.status === 'PENDING').length,
        approved: records.filter(r => r.status === 'APPROVED').length,
        rejected: records.filter(r => r.status === 'REJECTED').length,
    }), [records])

    const handleApprove = (recordId) => {
        setRecords(prev =>
            prev.map(r =>
                r.id === recordId
                    ? { ...r, status: 'APPROVED', approved_by: user.id, approved_at: new Date().toISOString() }
                    : r
            )
        )
        alert('Hồ sơ đã được phê duyệt!')
    }

    const handleReject = (recordId, reason) => {
        setRecords(prev =>
            prev.map(r =>
                r.id === recordId
                    ? { ...r, status: 'REJECTED', approved_by: user.id, approved_at: new Date().toISOString(), rejectionReason: reason }
                    : r
            )
        )
        alert('Hồ sơ đã bị từ chối!')
    }

    return (
        <div className="space-y-6">
            <ApprovalHeader />

            <ApprovalStats stats={stats} />

            <ApprovalFilterTabs
                filter={filter}
                stats={stats}
                onChange={setFilter}
            />

            <ApprovalRecordList
                records={filteredRecords}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    )
}

export default MedicalRecordApprovalList
