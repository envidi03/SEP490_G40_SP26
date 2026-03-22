// --- HÀM ÁNH XẠ TRẠNG THÁI (GỘP CHUNG MÀU CARD VÀ MÀU MODAL ĐỂ KHÔNG BAO GIỜ NHẦM) ---
export const getStatusConfig = (status) => {
  switch (status) {
    case 'DONE':
    case 'COMPLETED':
      return { 
        label: 'Hoàn thành', badgeVariant: 'success', 
        cardClass: 'bg-green-50/40 border-green-200 hover:border-green-400', iconColor: 'text-green-500',
        modalTheme: { headerBg: 'bg-green-50/80', iconBg: 'bg-green-500', border: 'border-green-200', ring: 'ring-green-100', text: 'text-green-600' }
      };
    case 'IN_PROGRESS':
      return { 
        label: 'Đang làm', badgeVariant: 'warning', // Giữ màu Cam cho Đang làm
        cardClass: 'bg-orange-50/40 border-orange-200 hover:border-orange-400', iconColor: 'text-orange-500',
        modalTheme: { headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-500', border: 'border-orange-200', ring: 'ring-orange-100', text: 'text-orange-600' }
      };
    case 'WAITING_APPROVAL':
      return { 
        label: 'Chờ duyệt', badgeVariant: 'secondary', // ĐỔI SANG MÀU TÍM HOÀN TOÀN TÁCH BIỆT
        cardClass: 'bg-purple-50/40 border-purple-200 hover:border-purple-400', iconColor: 'text-purple-500',
        modalTheme: { headerBg: 'bg-purple-50/80', iconBg: 'bg-purple-500', border: 'border-purple-200', ring: 'ring-purple-100', text: 'text-purple-600' }
      };
    case 'APPROVED':
      return { 
        label: 'Đã duyệt', badgeVariant: 'success', 
        cardClass: 'bg-teal-50/40 border-teal-200 hover:border-teal-400', iconColor: 'text-teal-500',
        modalTheme: { headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-500', border: 'border-teal-200', ring: 'ring-teal-100', text: 'text-teal-600' }
      };
    case 'REJECTED':
      return { 
        label: 'Từ chối', badgeVariant: 'danger', 
        cardClass: 'bg-red-50/40 border-red-200 hover:border-red-400', iconColor: 'text-red-500',
        modalTheme: { headerBg: 'bg-red-50/80', iconBg: 'bg-red-500', border: 'border-red-200', ring: 'ring-red-100', text: 'text-red-600' }
      };
    case 'CANCELLED':
      return { 
        label: 'Đã hủy', badgeVariant: 'danger', 
        cardClass: 'bg-gray-50/50 border-gray-200 hover:border-gray-400', iconColor: 'text-gray-500',
        modalTheme: { headerBg: 'bg-gray-50/80', iconBg: 'bg-gray-500', border: 'border-gray-200', ring: 'ring-gray-100', text: 'text-gray-600' }
      };
    case 'PLANNED':
    default:
      return { 
        label: 'Kế hoạch', badgeVariant: 'primary', 
        cardClass: 'bg-blue-50/30 border-blue-100 hover:border-blue-400', iconColor: 'text-blue-500',
        modalTheme: { headerBg: 'bg-blue-50/80', iconBg: 'bg-blue-600', border: 'border-blue-200', ring: 'ring-blue-100', text: 'text-blue-600' }
      };
  }
};