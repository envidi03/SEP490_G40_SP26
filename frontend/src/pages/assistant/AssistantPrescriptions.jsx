import { useState, useEffect, useCallback, useRef } from 'react';
import { Pill, Search, Eye, Edit, CheckCircle, Clock, AlertCircle, X, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import treatmentService from '../../services/treatmentService';
import inventoryService from '../../services/inventoryService';

// ─── STATUS HELPERS ──────────────────────────────────────────────────────────
const getStatusInfo = (status) => {
    const map = {
        PLANNED: { label: 'Kế hoạch', variant: 'default', icon: Clock },
        WAITING_APPROVAL: { label: 'Chờ duyệt', variant: 'warning', icon: Clock },
        APPROVED: { label: 'Đã duyệt', variant: 'primary', icon: CheckCircle },
        IN_PROGRESS: { label: 'Đang thực hiện', variant: 'warning', icon: AlertCircle },
        DONE: { label: 'Hoàn thành', variant: 'success', icon: CheckCircle },
        CANCELLED: { label: 'Đã hủy', variant: 'danger', icon: X },
        REJECTED: { label: 'Bị từ chối', variant: 'danger', icon: X },
    };
    return map[status] || { label: status, variant: 'default', icon: Clock };
};

// ─── MEDICINE SEARCH INPUT ────────────────────────────────────────────────────
const MedicineSearchInput = ({ value, onChange }) => {
    const [query, setQuery] = useState(value?.medicine_name || '');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync display name when value changes externally
    useEffect(() => {
        if (value?.medicine_name) setQuery(value.medicine_name);
    }, [value?.medicine_name]);

    const handleInput = (e) => {
        const q = e.target.value;
        setQuery(q);
        setIsOpen(true);
        clearTimeout(debounceRef.current);
        if (q.trim().length < 1) { setResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await inventoryService.getMedicines({ search: q, limit: 10, status: 'AVAILABLE' });
                const list = res?.data?.data || res?.data || [];
                setResults(Array.isArray(list) ? list : []);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelect = (med) => {
        setQuery(med.medicine_name);
        setIsOpen(false);
        onChange({ id: med._id, medicine_name: med.medicine_name, unit: med.unit, quantity_in_stock: med.quantity });
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        onChange(null);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder="Tìm tên thuốc..."
                    className="w-full pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
                {query && (
                    <button type="button" onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-52 overflow-y-auto">
                    {isSearching && <p className="text-xs text-gray-400 text-center py-3">Đang tìm...</p>}
                    {!isSearching && results.length === 0 && query.length > 0 && (
                        <p className="text-xs text-gray-400 text-center py-3">Không tìm thấy thuốc</p>
                    )}
                    {results.map((med) => (
                        <button
                            key={med._id}
                            type="button"
                            onMouseDown={() => handleSelect(med)}
                            className="w-full text-left px-3 py-2.5 hover:bg-teal-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            <p className="text-sm font-medium text-gray-800">{med.medicine_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {med.dosage_form && <span>{med.dosage_form} · </span>}
                                {med.unit} · Tồn kho: <span className={med.quantity <= 0 ? 'text-red-500' : 'text-green-600'}>{med.quantity}</span>
                                {med.dosage && <span> · {med.dosage}</span>}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── VIEW MEDICINE MODAL ──────────────────────────────────────────────────────
const ViewMedicineModal = ({ treatment, isOpen, onClose }) => {
    if (!isOpen || !treatment) return null;
    const meds = treatment.medicine_usage || [];
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Chi tiết đơn thuốc</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{treatment.tooth_position || treatment.note || ''}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {meds.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-8">Phiếu này chưa có thuốc nào.</p>
                    ) : (
                        <div className="space-y-3">
                            {meds.map((m, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                                        <Pill size={16} className="text-teal-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {m.medicine_id?.name || m.medicine_id?.medicine_name || 'Không rõ thuốc'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">Số lượng: <span className="font-medium">{m.quantity}</span></p>
                                        {m.usage_instruction && <p className="text-xs text-gray-500">Cách dùng: {m.usage_instruction}</p>}
                                        {m.note && <p className="text-xs text-gray-400 italic">{m.note}</p>}
                                        {m.dispensed && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                                <CheckCircle size={11} /> Đã cấp phát
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Đóng</button>
                </div>
            </div>
        </div>
    );
};

// ─── EDIT MEDICINE MODAL ──────────────────────────────────────────────────────
const EditMedicineModal = ({ treatment, isOpen, onClose, onSave }) => {
    const [medicines, setMedicines] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && treatment) {
            setMedicines(
                (treatment.medicine_usage || []).map((m) => ({
                    // chosen holds { id, medicine_name } from the picker
                    chosen: {
                        id: m.medicine_id?._id || m.medicine_id || '',
                        medicine_name: m.medicine_id?.name || m.medicine_id?.medicine_name || '',
                    },
                    quantity: m.quantity ?? 1,
                    usage_instruction: m.usage_instruction || '',
                    note: m.note || '',
                    dispensed: m.dispensed || false,
                }))
            );
            setError(null);
        }
    }, [isOpen, treatment]);

    if (!isOpen || !treatment) return null;

    const handleChange = (idx, field, value) =>
        setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: field === 'quantity' ? Number(value) : value } : m)));

    const handleMedicinePick = (idx, picked) =>
        setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, chosen: picked } : m)));

    const handleAdd = () =>
        setMedicines((prev) => [...prev, { chosen: null, quantity: 1, usage_instruction: '', note: '', dispensed: false }]);

    const handleRemove = (idx) => setMedicines((prev) => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await treatmentService.updateTreatmentMedicine(treatment._id, {
                medicine_usage: medicines.filter((m) => m.chosen?.id).map((m) => ({
                    medicine_id: m.chosen.id,
                    quantity: m.quantity,
                    usage_instruction: m.usage_instruction || undefined,
                    note: m.note || undefined,
                    dispensed: m.dispensed,
                })),
            });
            onSave();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Kê đơn thuốc</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{treatment.tooth_position || treatment.note || 'Phiếu điều trị'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </div>
                <form id="medicine-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    {medicines.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-4">Chưa có thuốc nào. Thêm thuốc bên dưới.</p>
                    )}
                    {medicines.map((m, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Thuốc #{idx + 1}</span>
                                <button type="button" onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Thuốc <span className="text-red-400">*</span></label>
                                    <MedicineSearchInput
                                        value={m.chosen}
                                        onChange={(picked) => handleMedicinePick(idx, picked)}
                                    />
                                    {!m.chosen?.id && (
                                        <p className="text-xs text-red-400 mt-1">Vui lòng chọn thuốc từ danh sách</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Số lượng</label>
                                    <input type="number" min={1} value={m.quantity}
                                        onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Hướng dẫn dùng thuốc</label>
                                    <input type="text" value={m.usage_instruction}
                                        onChange={(e) => handleChange(idx, 'usage_instruction', e.target.value)}
                                        placeholder="VD: Uống 2 viên / ngày sau ăn"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú</label>
                                    <input type="text" value={m.note}
                                        onChange={(e) => handleChange(idx, 'note', e.target.value)}
                                        placeholder="Ghi chú thêm..."
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="checkbox" id={`dispensed-${idx}`} checked={m.dispensed}
                                        onChange={(e) => handleChange(idx, 'dispensed', e.target.checked)}
                                        className="w-4 h-4 rounded accent-teal-500" />
                                    <label htmlFor={`dispensed-${idx}`} className="text-sm text-gray-600">Đã cấp phát thuốc</label>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAdd}
                        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-teal-400 hover:text-teal-500 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Thêm thuốc
                    </button>
                    {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
                </form>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                    <button type="submit" form="medicine-form" disabled={isSaving}
                        className="px-6 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition">
                        {isSaving ? 'Đang lưu...' : 'Lưu đơn thuốc'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AssistantPrescriptions = () => {
    const [dentalRecords, setDentalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [viewTreatment, setViewTreatment] = useState(null);
    const [editTreatment, setEditTreatment] = useState(null);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await treatmentService.getAllDentalRecordsWithTreatments({
                limit: 100,
                filter_dental_record: 'IN_PROGRESS',
            });
            const raw = res?.data;
            const records = Array.isArray(raw) ? raw : (raw?.data || []);
            setDentalRecords(records);
        } catch (err) {
            console.error('Fetch dental records:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    // Flatten to rows: only IN_PROGRESS treatments from IN_PROGRESS records
    const rows = dentalRecords.flatMap((record) =>
        (record.treatments || [])
            .filter((t) => t.status === 'IN_PROGRESS')
            .map((t) => ({ ...t, _record: record }))
    );

    // Apply search / date filter
    const filtered = rows.filter((row) => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !q ||
            row._record?.full_name?.toLowerCase().includes(q) ||
            row._record?.phone?.includes(q) ||
            row._record?.record_name?.toLowerCase().includes(q) ||
            row.tooth_position?.toLowerCase().includes(q) ||
            row.note?.toLowerCase().includes(q);

        const matchDate = !filterDate ||
            (row.performed_date && new Date(row.performed_date).toISOString().startsWith(filterDate)) ||
            (row.planned_date && new Date(row.planned_date).toISOString().startsWith(filterDate));

        return matchSearch && matchDate;
    });

    // Stats
    const totalMeds = filtered.reduce((acc, t) => acc + (t.medicine_usage || []).length, 0);
    const dispensedMeds = filtered.reduce((acc, t) => acc + (t.medicine_usage || []).filter((m) => m.dispensed).length, 0);
    const pendingMeds = totalMeds - dispensedMeds;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h1>
                    <p className="text-gray-600 mt-1">Kê đơn và cấp phát thuốc cho bệnh nhân đang điều trị</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Phiếu đang điều trị</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{filtered.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full"><Pill size={24} className="text-blue-600" /></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Thuốc đã cấp phát</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{dispensedMeds}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full"><CheckCircle size={24} className="text-green-600" /></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Thuốc chưa cấp phát</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingMeds}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full"><Clock size={24} className="text-amber-600" /></div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân, SĐT, tên hồ sơ, vị trí răng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thực hiện</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[13px] mb-4">{error}</div>
            )}

            {/* Table */}
            <Card>
                {isLoading ? (
                    <div className="space-y-3 p-5 animate-pulse">
                        <div className="h-10 bg-gray-100 rounded-xl" />
                        <div className="h-16 bg-gray-50 rounded-xl" />
                        <div className="h-16 bg-gray-50 rounded-xl" />
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hồ sơ / Phiếu</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày thực hiện</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số thuốc</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((row) => {
                                    const statusInfo = getStatusInfo(row.status);
                                    const StatusIcon = statusInfo.icon;
                                    const meds = row.medicine_usage || [];
                                    const dispensed = meds.filter((m) => m.dispensed).length;

                                    return (
                                        <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-gray-900 text-sm">{row._record?.full_name || '—'}</p>
                                                <p className="text-xs text-gray-500">{row._record?.phone || ''}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm font-medium text-gray-700 max-w-[200px] truncate">{row._record?.record_name || '—'}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.tooth_position || row.note || 'Phiếu điều trị'}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm text-gray-600">
                                                    {row.performed_date
                                                        ? new Date(row.performed_date).toLocaleDateString('vi-VN')
                                                        : row.planned_date
                                                            ? new Date(row.planned_date).toLocaleDateString('vi-VN')
                                                            : '—'}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {meds.length > 0 ? (
                                                    <span className="inline-flex items-center justify-center gap-1.5">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">{meds.length}</span>
                                                        <span className="text-xs text-gray-400">{dispensed}/{meds.length} cấp</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-500 italic">Chưa kê</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex justify-center gap-1">
                                                    {meds.length > 0 && (
                                                        <button
                                                            onClick={() => setViewTreatment(row)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Xem chi tiết đơn thuốc"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setEditTreatment(row)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Kê / Chỉnh sửa đơn thuốc"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Không có phiếu điều trị nào đang thực hiện</p>
                    </div>
                )}
            </Card>

            {/* Modals */}
            <ViewMedicineModal
                treatment={viewTreatment}
                isOpen={!!viewTreatment}
                onClose={() => setViewTreatment(null)}
            />
            <EditMedicineModal
                treatment={editTreatment}
                isOpen={!!editTreatment}
                onClose={() => setEditTreatment(null)}
                onSave={fetchRecords}
            />
        </div>
    );
};

export default AssistantPrescriptions;
