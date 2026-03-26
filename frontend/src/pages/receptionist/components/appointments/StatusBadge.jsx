import Badge from '../../../../components/ui/Badge';

export const getStatusVariant = (status) => {
    switch (status) {
        case 'COMPLETED': return 'primary';
        case 'CHECKED_IN': return 'success';
        case 'IN_CONSULTATION': return 'success';
        case 'SCHEDULED': return 'warning';
        case 'PENDING_CONFIRMATION': return 'warning';
        case 'CANCELLED': return 'danger';
        case 'NO_SHOW': return 'danger';
        default: return 'default';
    }
};

export const getStatusLabel = (status) => {
    switch (status) {
        case 'SCHEDULED': return 'Chờ khám';
        case 'PENDING_CONFIRMATION': return 'Chờ xác nhận lại';
        case 'CHECKED_IN': return 'Đã đến';
        case 'IN_CONSULTATION': return 'Đang khám';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        case 'NO_SHOW': return 'Không đến';
        default: return status;
    }
};

const StatusBadge = ({ status }) => {
    return (
        <Badge variant={getStatusVariant(status)}>
            {getStatusLabel(status)}
        </Badge>
    );
};

export default StatusBadge;
