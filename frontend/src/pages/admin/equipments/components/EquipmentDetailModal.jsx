import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Calendar, Wrench, Box, Hash,
    ChevronLeft, ChevronRight, Loader2,
    Activity, ClipboardList
} from 'lucide-react';
import { formatDate } from '../../../../utils/dateUtils';
import equipmentService from '../../../../services/equipmentService';

const TABS = [
    { id: 'info', label: 'Thông tin', icon: Box },
    { id: 'logs', label: 'Nhật ký sử dụng', icon: Activity },
    { id: 'maintenance', label: 'Lịch sử bảo trì', icon: Wrench },
];

const EquipmentDetailModal = ({ show, equipment, onClose, getStatusColor, getStatusText }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    // Logs state
    const [logsPage, setLogsPage] = useState(1);
    const [logsStart, setLogsStart] = useState('');
    const [logsEnd, setLogsEnd] = useState('');
    const [pendingLogsStart, setPendingLogsStart] = useState('');
    const [pendingLogsEnd, setPendingLogsEnd] = useState('');

    // Maintenance state
    const [maintPage, setMaintPage] = useState(1);
    const [maintStart, setMaintStart] = useState('');
    const [maintEnd, setMaintEnd] = useState('');
    const [pendingMaintStart, setPendingMaintStart] = useState('');
    const [pendingMaintEnd, setPendingMaintEnd] = useState('');

    const LIMIT = 5;

    const fetchDetail = useCallback(async (lPage, mPage, lStart, lEnd, mStart, mEnd) => {
        if (!equipment?._id) return;
        setLoading(true);
        try {
            const params = {
                page_equipments_logs: lPage,
                limit_equipments_logs: LIMIT,
                page_maintence_history: mPage,
                limit_maintence_history: LIMIT,
                ...(lStart && { 'filter_equipments_logs[usage_start_date]': lStart }),
                ...(lEnd && { 'filter_equipments_logs[usage_end_date]': lEnd }),
                ...(mStart && { 'filter_maintence_history[maintence_start_date]': mStart }),
                ...(mEnd && { 'filter_maintence_history[maintence_end_date]': mEnd }),
            };
            const res = await equipmentService.getEquipmentById(equipment._id, params);
            setDetail(res?.data?.data || null);
        } catch (err) {
            console.error('Error fetching equipment detail:', err);
        } finally {
            setLoading(false);
        }
    }, [equipment?._id]);

    // Reset khi modal mở
    useEffect(() => {
        if (show && equipment?._id) {
            setActiveTab('info');
            setLogsPage(1); setLogsStart(''); setLogsEnd('');
            setPendingLogsStart(''); setPendingLogsEnd('');
            setMaintPage(1); setMaintStart(''); setMaintEnd('');
            setPendingMaintStart(''); setPendingMaintEnd('');
            fetchDetail(1, 1, '', '', '', '');
        }
    }, [show, equipment?._id]);

    if (!show || !equipment) return null;

    // ===== DATA =====
    const logItems = detail?.equipments_log?.items || [];
    const logPagination = detail?.equipments_log?.pagination || {};
    const logTotalPages = logPagination.totalPages || 1;

    const maintItems = detail?.maintenance_history?.items || [];
    const maintPagination = detail?.maintenance_history?.pagination || {};
    const maintTotalPages = maintPagination.totalPages || 1;

    // ===== HANDLERS =====
    const handleApplyLogs = () => {
        setLogsStart(pendingLogsStart);
        setLogsEnd(pendingLogsEnd);
        setLogsPage(1);
        fetchDetail(1, maintPage, pendingLogsStart, pendingLogsEnd, maintStart, maintEnd);
    };

    const handleClearLogs = () => {
        setPendingLogsStart(''); setPendingLogsEnd('');
        setLogsStart(''); setLogsEnd(''); setLogsPage(1);
        fetchDetail(1, maintPage, '', '', maintStart, maintEnd);
    };

    const handleLogsPageChange = (p) => {
        setLogsPage(p);
        fetchDetail(p, maintPage, logsStart, logsEnd, maintStart, maintEnd);
    };

    const handleApplyMaint = () => {
        setMaintStart(pendingMaintStart);
        setMaintEnd(pendingMaintEnd);
        setMaintPage(1);
        fetchDetail(logsPage, 1, logsStart, logsEnd, pendingMaintStart, pendingMaintEnd);
    };

    const handleClearMaint = () => {
        setPendingMaintStart(''); setPendingMaintEnd('');
        setMaintStart(''); setMaintEnd(''); setMaintPage(1);
        fetchDetail(logsPage, 1, logsStart, logsEnd, '', '');
    };

    const handleMaintPageChange = (p) => {
        setMaintPage(p);
        fetchDetail(logsPage, p, logsStart, logsEnd, maintStart, maintEnd);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                        <div className="pr-8">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-2 bg-white/20 border-white/30 text-white">
                                {equipment.equipment_type}
                            </span>
                            <h2 className="text-2xl font-bold">{equipment.equipment_name}</h2>
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(equipment.status)} bg-white`}>
                                    {getStatusText(equipment.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 overflow-y-auto flex-1">

                        {/* ===== TAB: Thông tin ===== */}
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard icon={<Hash size={15} />} label="Số Serial" value={equipment.equipment_serial_number || 'N/A'} mono />
                                    <InfoCard icon={<Calendar size={15} />} label="Ngày mua" value={formatDate(equipment.purchase_date)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard icon={<Box size={15} />} label="Nhà cung cấp" value={equipment.supplier || 'N/A'} />
                                    <InfoCard icon={<Wrench size={15} />} label="Hạn bảo hành" value={equipment.warranty ? formatDate(equipment.warranty) : 'N/A'} />
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Số lần sử dụng</p>
                                        <p className="font-bold text-xl text-blue-700">{logPagination.totalItems ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Lần bảo trì</p>
                                        <p className="font-bold text-xl text-indigo-700">{maintPagination.totalItems ?? '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== TAB: Nhật ký sử dụng ===== */}
                        {activeTab === 'logs' && (
                            <LogSection
                                title="Nhật ký sử dụng"
                                items={logItems}
                                pagination={logPagination}
                                page={logsPage}
                                totalPages={logTotalPages}
                                loading={loading}
                                pendingStart={pendingLogsStart}
                                pendingEnd={pendingLogsEnd}
                                hasFilter={!!(logsStart || logsEnd)}
                                onPendingStartChange={setPendingLogsStart}
                                onPendingEndChange={setPendingLogsEnd}
                                onApplyFilter={handleApplyLogs}
                                onClearFilter={handleClearLogs}
                                onPageChange={handleLogsPageChange}
                                renderRow={(item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={13} className="text-blue-400" />
                                                {item.usage_date ? formatDate(item.usage_date) : '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.purpose || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.note || '—'}</td>
                                    </tr>
                                )}
                                headers={['Ngày sử dụng', 'Mục đích', 'Ghi chú']}
                                emptyText="Chưa có nhật ký sử dụng"
                            />
                        )}

                        {/* ===== TAB: Lịch sử bảo trì ===== */}
                        {activeTab === 'maintenance' && (
                            <LogSection
                                title="Lịch sử bảo trì"
                                items={maintItems}
                                pagination={maintPagination}
                                page={maintPage}
                                totalPages={maintTotalPages}
                                loading={loading}
                                pendingStart={pendingMaintStart}
                                pendingEnd={pendingMaintEnd}
                                hasFilter={!!(maintStart || maintEnd)}
                                onPendingStartChange={setPendingMaintStart}
                                onPendingEndChange={setPendingMaintEnd}
                                onApplyFilter={handleApplyMaint}
                                onClearFilter={handleClearMaint}
                                onPageChange={handleMaintPageChange}
                                renderRow={(item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={13} className="text-orange-400" />
                                                {item.maintenance_date ? formatDate(item.maintenance_date) : '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.description || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.performed_by || '—'}</td>
                                    </tr>
                                )}
                                headers={['Ngày bảo trì', 'Mô tả', 'Người thực hiện']}
                                emptyText="Chưa có lịch sử bảo trì"
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 shadow-sm">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== Sub-components =====

const InfoCard = ({ icon, label, value, mono = false }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">{icon} {label}</p>
        <p className={`text-base font-bold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
);

const LogSection = ({
    items, pagination, page, totalPages, loading,
    pendingStart, pendingEnd, hasFilter,
    onPendingStartChange, onPendingEndChange,
    onApplyFilter, onClearFilter, onPageChange,
    renderRow, headers, emptyText
}) => (
    <div>
        {/* Filter */}
        <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
                <input type="date" value={pendingStart} onChange={e => onPendingStartChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
                <input type="date" value={pendingEnd} onChange={e => onPendingEndChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <button onClick={onApplyFilter}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Lọc
            </button>
            {hasFilter && (
                <button onClick={onClearFilter}
                    className="px-3 py-2 text-gray-600 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-100">
                    Xóa lọc
                </button>
            )}
            {pagination.totalItems !== undefined && (
                <span className="text-xs text-gray-500 ml-auto">
                    {pagination.totalItems} bản ghi
                </span>
            )}
        </div>

        {/* Table */}
        {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={30} /></div>
        ) : (
            <>
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {headers.map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.length > 0 ? items.map(renderRow) : (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-400 italic">{emptyText}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />}
            </>
        )}
    </div>
);

const PaginationBar = ({ page, totalPages, onPageChange }) => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
        <div className="flex items-center justify-center gap-1">
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={15} />
            </button>
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {p}
                </button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={15} />
            </button>
        </div>
    );
};

export default EquipmentDetailModal;
