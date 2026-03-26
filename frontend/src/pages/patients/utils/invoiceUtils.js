import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export const getStatusConfig = (status) => {
    switch (status) {
        case 'COMPLETED':
            return { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle };
        case 'PENDING':
            return { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock };
        case 'CANCELLED':
            return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle };
        default:
            return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', Icon: FileText };
    }
};

export const formatMoney = (amount) =>
    amount != null ? amount.toLocaleString('vi-VN') + 'đ' : '—';
