import { useState, useEffect, useCallback } from 'react';
import {
    Wrench, Search, ChevronDown, AlertTriangle, Send,
    CheckCircle, RefreshCw, Package, Clock
} from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const ISSUE_TYPES = [
    { value: 'MALFUNCTION', label: '⚙️ Trục trặc kỹ thuật' },
    { value: 'MAINTENANCE', label: '🔧 Cần bảo trì' },
    { value: 'BROKEN',      label: '💥 Hỏng hoàn toàn' },
    { value: 'MISSING',     label: '❓ Mất linh kiện' },
    { value: 'OTHER',       label: '📝 Khác' },
];

const SEVERITIES = [
    { value: 'LOW',      label: 'Nhẹ',          color: 'border-green-200 text-green-700 bg-green-50',     active: 'ring-green-400 border-green-400 bg-green-100' },
    { value: 'MEDIUM',   label: 'Trung bình',   color: 'border-yellow-200 text-yellow-700 bg-yellow-50', active: 'ring-yellow-400 border-yellow-400 bg-yellow-100' },
    { value: 'HIGH',     label: 'Nghiêm trọng', color: 'border-red-200 text-red-700 bg-red-50',          active: 'ring-red-400 border-red-400 bg-red-100' },
    { value: 'CRITICAL', label: '🚨 Khẩn cấp',  color: 'border-red-300 text-red-900 bg-red-100',         active: 'ring-red-600 border-red-500 bg-red-200' },
];

const STATUS_LABELS = {
    READY: 'Sẵn sàng', IN_USE: 'Đang dùng', MAINTENANCE: 'Bảo trì',
    REPAIRING: 'Đang sửa', FAULTY: 'Hỏng', STERILIZING: 'Khử trùng',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AssistantEquipment = () => {
    const [equipments, setEquipments]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch]           = useState('');
    const [selectedEq, setSelectedEq]   = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [submitted, setSubmitted]     = useState(false);
    const [recentReports, setRecentReports] = useState([]);

    const [form, setForm] = useState({
        issue_type: 'MALFUNCTION',
        severity: 'MEDIUM',
        description: '',
    });

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const loadEquipments = useCallback(async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (search) params.search = search;
            const res = await equipmentService.getEquipments(params);
            setEquipments(res?.data?.data || []);
        } catch {
            toast.error('Không thể tải danh sách thiết bị');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadEquipments(); }, [loadEquipments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEq) { toast.error('Vui lòng chọn thiết bị'); return; }
        if (!form.description.trim()) { toast.error('Vui lòng nhập mô tả sự cố'); return; }

        setSubmitting(true);
        try {
            await equipmentService.reportIncident(selectedEq._id, form);
            toast.success('Báo cáo sự cố đã được gửi thành công!');
            setRecentReports(prev => [{
                equipment: selectedEq.equipment_name,
                issue_type: ISSUE_TYPES.find(t => t.value === form.issue_type)?.label,
                severity: form.severity,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                description: form.description.slice(0, 60),
            }, ...prev.slice(0, 4)]);
            // Reset form
            setSelectedEq(null);
            setForm({ issue_type: 'MALFUNCTION', severity: 'MEDIUM', description: '' });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            toast.error(err?.data?.message || 'Gửi báo cáo thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wrench className="text-orange-500" size={24} />
                    Báo cáo sự cố thiết bị
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Chọn thiết bị bị hỏng và mô tả sự cố để gửi báo cáo đến bộ phận kỹ thuật
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── LEFT: Equipment Selector ── */}
                <div className="lg:col-span-1 rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
                        <p className="font-semibold text-gray-900 text-sm mb-3">Chọn thiết bị</p>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                            <Search size={15} className="text-gray-400 shrink-0" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Tìm thiết bị..."
                                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 max-h-[440px]">
                        {loading ? (
                            <div className="flex flex-col gap-2 p-4">
                                {Array.from({length: 6}).map((_, i) => (
                                    <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : equipments.length === 0 ? (
                            <div className="flex flex-col items-center py-12 text-gray-400">
                                <Package size={32} className="text-gray-200 mb-2" />
                                <p className="text-sm">Không tìm thấy thiết bị</p>
                            </div>
                        ) : (
                            <div className="p-3 flex flex-col gap-1.5">
                                {equipments.map(eq => {
                                    const isSelected = selectedEq?._id === eq._id;
                                    return (
                                        <button
                                            key={eq._id}
                                            type="button"
                                            onClick={() => setSelectedEq(eq)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ${
                                                isSelected
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'hover:bg-orange-50 text-gray-700'
                                            }`}
                                        >
                                            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {eq.equipment_name}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                                                {eq.equipment_serial_number}
                                                {eq.status && <> · {STATUS_LABELS[eq.status] || eq.status}</>}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Report Form ── */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Form card */}
                    <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm p-6">

                        {/* Selected equipment banner */}
                        {selectedEq ? (
                            <div className="mb-5 flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <Wrench size={16} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-orange-900 text-sm">{selectedEq.equipment_name}</p>
                                        <p className="text-xs text-orange-600">{selectedEq.equipment_serial_number}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedEq(null)}
                                    className="text-xs text-orange-500 hover:text-orange-700 underline"
                                >Đổi thiết bị</button>
                            </div>
                        ) : (
                            <div className="mb-5 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-400">
                                ← Chọn thiết bị bên trái để bắt đầu báo cáo
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Issue type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại sự cố <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={form.issue_type}
                                        onChange={e => setForm(p => ({ ...p, issue_type: e.target.value }))}
                                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none bg-white"
                                    >
                                        {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mức độ nghiêm trọng <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {SEVERITIES.map(s => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, severity: s.value }))}
                                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                                form.severity === s.value
                                                    ? s.active + ' ring-2 ring-offset-1'
                                                    : s.color + ' hover:opacity-80'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả sự cố <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={5}
                                    placeholder="Mô tả chi tiết: biểu hiện hỏng hóc, thời điểm phát hiện, cách tái hiện lỗi (nếu có)..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 ký tự</p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || !selectedEq}
                                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                    bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/25 active:scale-[0.98]"
                            >
                                {submitted ? (
                                    <><CheckCircle size={18} /> Đã gửi thành công!</>
                                ) : submitting ? (
                                    <><RefreshCw size={18} className="animate-spin" /> Đang gửi...</>
                                ) : (
                                    <><Send size={18} /> Gửi báo cáo sự cố</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Recent reports */}
                    {recentReports.length > 0 && (
                        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={15} className="text-gray-400" />
                                <p className="text-sm font-semibold text-gray-700">Báo cáo vừa gửi</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {recentReports.map((r, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                                        <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{r.equipment}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{r.description}...</p>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">{r.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssistantEquipment;
