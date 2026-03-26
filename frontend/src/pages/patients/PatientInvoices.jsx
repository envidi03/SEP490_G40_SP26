import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import SharedPagination from '../../components/ui/SharedPagination';
import { getProfile } from '../../services/profileService';
import billingService from '../../services/billingService';
import { ArrowLeft, Loader2, Receipt } from 'lucide-react';

// New Components
import InvoiceStats from './components/InvoiceStats';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceCard from './components/InvoiceCard';
import InvoiceDetailModal from './components/modals/InvoiceDetailModal';
import QRPaymentModal from './components/modals/QRPaymentModal';

const PatientInvoices = () => {
    const navigate = useNavigate();

    /* ─── 1. State Declarations ─────────────────────────────────────── */
    // Identity and primary data
    const [patientId, setPatientId] = useState(null);
    const [invoices, setInvoices] = useState([]);

    // UI state (Loading, Pagination, Filtering)
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 6;

    // Modal and Notification management
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    /* ─── 2. Lifecycle & Effects ────────────────────────────────────── */

    /**
     * Effect: Fetch patient_id from the current user's Profile on mount.
     * patient_id is required to filter invoices on the backend.
     */
    useEffect(() => {
        setLoading(true);
        getProfile()
            .then(res => {
                const pid = res?.data?.patient_id;
                if (pid) {
                    setPatientId(pid);
                } else {
                    setToast({ show: true, type: 'error', message: 'Your account does not have patient information!' });
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Error fetching profile:', err);
                setToast({ show: true, type: 'error', message: 'Unable to verify user information!' });
                setLoading(false);
            });
    }, []);

    /* ─── 3. Handlers ──────────────────────────────────────────────── */

    /**
     * Fetches the list of invoices from the backend.
     * Flexible handling for different response data structures.
     */
    const fetchInvoices = useCallback(async (page = 1) => {
        if (!patientId) return;
        setLoading(true);
        try {
            const params = { page, limit: pageSize };
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await billingService.getPatientInvoices(patientId, params);

            let list = [];
            let pagination = {};

            // Flexible data extraction logic (prevents app from crashing if backend wrapper changes)
            if (Array.isArray(res?.data)) {
                // Case: res.data is a direct array
                list = res.data;
                pagination = res.pagination || {};
            } else if (Array.isArray(res)) {
                // Case: res itself is an array (if interceptor already unwrapped it)
                list = res;
            } else if (res?.data?.data && Array.isArray(res.data.data)) {
                // Case: nested structure { data: { data: [...] } }
                list = res.data.data;
                pagination = res.data.pagination || {};
            } else {
                // Default
                list = res?.data || [];
                pagination = res?.pagination || {};
            }

            setInvoices(list);
            setTotalItems(pagination.totalItems || list.length);
            setTotalPages(pagination.totalPages || Math.ceil((pagination.totalItems || list.length) / pageSize) || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error loading invoices:', err);
            setToast({ show: true, type: 'error', message: 'Unable to load invoice list!' });
        } finally {
            setLoading(false);
        }
    }, [patientId, statusFilter]);

    /**
     * Effect: Automatically reload the first page whenever patientId or statusFilter changes.
     */
    useEffect(() => {
        fetchInvoices(1);
    }, [fetchInvoices]);

    /**
     * Opens the invoice detail modal.
     * Also fetches the full invoice by ID to get the complete service breakdown.
     */
    const handleViewDetail = async (invoice) => {
        try {
            const res = await billingService.getInvoiceById(invoice._id || invoice.id);
            setSelectedInvoice(res?.data?.data || res?.data || invoice);
        } catch {
            setSelectedInvoice(invoice);
        }
        setShowDetail(true);
    };

    /**
     * Switches from the Detail Modal to the QR Payment Modal.
     */
    const handlePay = (invoice) => {
        setShowDetail(false);
        setSelectedInvoice(invoice);
        setShowQR(true);
    };

    // Calculate invoice counts by status for the mini dashboard
    // Add defensive filtering to avoid crashing if data is malformed
    const safeInvoices = Array.isArray(invoices) ? invoices.filter(Boolean) : [];
    const pendingCount = safeInvoices.filter(i => i.status === 'PENDING').length;
    const completedCount = safeInvoices.filter(i => i.status === 'COMPLETED').length;

    /* ─── 4. Render Layout ─────────────────────────────────────────── */
    // Log state for debugging blank screens
    if (import.meta.env.DEV) {
        console.log('[PatientInvoices] Render:', {
            loading,
            patientId,
            invoicesCount: safeInvoices.length,
            statusFilter
        });
    }

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Quay Lại</span>
                    </button>

                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hóa đơn của tôi</h1>
                        <p className="text-gray-600">Xem lịch sử thanh toán và quản lý hóa đơn</p>
                    </div>

                    {/* Quick statistics section */}
                    <InvoiceStats pendingCount={pendingCount} completedCount={completedCount} />

                    {/* Status filtering chips */}
                    <InvoiceFilters statusFilter={statusFilter} onFilterChange={(status) => setStatusFilter(status)} />

                    {/* Main content body: Loading / Empty / List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={40} className="animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500 text-lg">Loading invoices...</span>
                        </div>
                    ) : safeInvoices.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                            <Receipt size={64} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
                            <p className="text-gray-500">Your medical treatment invoices will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {safeInvoices.map((inv) => (
                                <InvoiceCard
                                    key={inv?._id || inv?.id || Math.random()}
                                    invoice={inv}
                                    onViewDetail={handleViewDetail}
                                    onPay={handlePay}
                                />
                            ))}

                            {/* Pagination component */}
                            <SharedPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                onPageChange={(p) => fetchInvoices(p)}
                                itemLabel="invoices"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 5. Modals & Overlays ────────────────────────────────── */}

            {/* Invoice Detail Modal */}
            {showDetail && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    onClose={() => setShowDetail(false)}
                    onPay={handlePay}
                />
            )}

            {/* QR Payment Modal */}
            {showQR && (
                <QRPaymentModal
                    invoice={selectedInvoice}
                    onClose={() => { setShowQR(false); fetchInvoices(currentPage); }}
                />
            )}

            {/* Global Toast Notification */}
            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </PublicLayout>
    );
};

export default PatientInvoices;
