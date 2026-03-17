import api from './api';

const billingService = {
    // Lấy danh sách hóa đơn (hỗ trợ search, status, page, limit)
    getAllInvoices: (params) => {
        return api.get('/api/billing', { params });
    },

    // Thống kê tổng quan hóa đơn
    getInvoiceStats: () => {
        return api.get('/api/billing/stats');
    },

    // Lấy chi tiết hóa đơn
    getInvoiceById: (id) => {
        return api.get(`/api/billing/${id}`);
    },

    // Tạo hóa đơn mới
    createInvoice: (data) => {
        return api.post('/api/billing', data);
    },

    // Cập nhật trạng thái hóa đơn (COMPLETED, CANCELLED)
    updateInvoiceStatus: (id, statusData) => {
        return api.put(`/api/billing/${id}/status`, statusData);
    },

    // Kiểm tra trạng thái thanh toán qua QR
    checkPaymentStatus: (invoiceCode) => {
        return api.get(`/api/payment/invoices/check-status/${invoiceCode}`);
    }
};

export default billingService;
