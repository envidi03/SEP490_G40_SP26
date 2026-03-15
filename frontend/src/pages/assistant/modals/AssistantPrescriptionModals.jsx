import { useState, useEffect, useRef } from 'react';
import { Pill, Search, CheckCircle, X, Plus, Trash2, Clock, Info } from 'lucide-react';
import treatmentService from '../../../services/treatmentService';
import inventoryService from '../../../services/inventoryService';

// ─── MEDICINE SEARCH INPUT ────────────────────────────────────────────────────
export const MedicineSearchInput = ({ value, onChange }) => {
    const [query, setQuery] = useState(value?.medicine_name || '');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (value?.medicine_name) setQuery(value.medicine_name);
        else if (value === null) setQuery('');
    }, [value]);

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
            <div className="relative group">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-teal-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder="Tìm tên thuốc..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all shadow-sm group-hover:border-gray-300"
                />
                {query && (
                    <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {isSearching && (
                            <div className="flex flex-col items-center py-6 px-4">
                                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-xs text-gray-500 font-medium">Đang tìm kiếm...</p>
                            </div>
                        )}
                        {!isSearching && results.length === 0 && query.length > 0 && (
                            <div className="py-8 px-4 text-center">
                                <Info size={24} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500 font-medium">Không tìm thấy thuốc "{query}"</p>
                            </div>
                        )}
                        {results.map((med) => (
                            <button
                                key={med._id}
                                type="button"
                                onMouseDown={() => handleSelect(med)}
                                className="w-full text-left px-4 py-3 hover:bg-teal-50/50 transition-colors border-b border-gray-50 last:border-0 group"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{med.medicine_name}</p>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{med.unit}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                        {med.dosage_form && <span>{med.dosage_form}</span>}
                                        {med.dosage && <span> • {med.dosage}</span>}
                                    </p>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <p className="text-xs font-semibold">
                                        Tồn kho: <span className={med.quantity <= 0 ? 'text-rose-500' : 'text-emerald-600 font-bold'}>{med.quantity}</span>
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── VIEW MEDICINE MODAL ──────────────────────────────────────────────────────
export const ViewMedicineModal = ({ treatment, isOpen, onClose }) => {
    if (!isOpen || !treatment) return null;
    const meds = treatment.medicine_usage || [];

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Chi tiết đơn thuốc</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                                <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                                    {treatment.tooth_position || 'Phiêu điều trị'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 p-2.5 rounded-full transition-all duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {treatment.note && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 font-medium italic">
                            "{treatment.note}"
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-8 py-6 scroll-smooth custom-scrollbar bg-gray-50/30">
                    {meds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-60">
                            <Pill size={64} className="text-gray-200 mb-4" />
                            <p className="text-base font-bold text-gray-400">Phiếu này chưa được kê thuốc</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Clock size={16} className="text-teal-600" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục thuốc ({meds.length})</span>
                            </div>
                            {meds.map((m, idx) => (
                                <div key={idx} className="group relative bg-white hover:bg-teal-50/20 p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3.5 bg-teal-50 text-teal-600 rounded-[18px] shrink-0 transition-colors group-hover:bg-teal-100">
                                            <Pill size={22} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-[17px] font-bold text-gray-900 leading-tight">
                                                    {m.medicine_id?.name || m.medicine_id?.medicine_name || 'Không rõ thuốc'}
                                                </p>
                                                <span className="shrink-0 bg-teal-50 text-teal-700 text-[11px] font-extrabold px-3 py-1 rounded-full border border-teal-100">
                                                    SL: {m.quantity}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2.5">
                                                {m.usage_instruction && (
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div>
                                                        <p className="text-[14px] text-gray-700 font-medium leading-[1.4]">
                                                            <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider block mb-0.5">Cách dùng:</span>
                                                            {m.usage_instruction}
                                                        </p>
                                                    </div>
                                                )}
                                                {m.note && (
                                                    <p className="text-[13px] text-gray-500 font-medium italic pl-4 border-l-2 border-gray-100">
                                                        {m.note}
                                                    </p>
                                                )}
                                                {m.dispensed && (
                                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                                                        <CheckCircle size={14} />
                                                        Đã cấp phát thuốc
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-white sticky bottom-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-10 py-3 rounded-2xl bg-teal-500 text-white text-sm font-bold hover:bg-teal-600 active:scale-95 transition-all shadow-lg shadow-teal-100"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── EDIT MEDICINE MODAL ──────────────────────────────────────────────────────
export const EditMedicineModal = ({ treatment, isOpen, onClose, onSave }) => {
    const [medicines, setMedicines] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && treatment) {
            setMedicines(
                (treatment.medicine_usage || []).map((m) => ({
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
        setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: field === 'quantity' ? Math.max(1, Number(value)) : value } : m)));

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
            setError(err?.response?.data?.message || 'Không thể lưu đơn thuốc. Vui lòng kiểm tra lại.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-[900] text-gray-900 tracking-tight">Kê đơn thuốc</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                                {treatment.tooth_position || 'Phiêu điều trị'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form id="medicine-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-8 py-6 space-y-6 bg-gray-50/30 custom-scrollbar">
                    {medicines.length === 0 && (
                        <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-[24px]">
                            <Pill size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-400">Danh sách đơn thuốc hiện đang trống</p>
                            <button type="button" onClick={handleAdd} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Thêm thuốc ngay</button>
                        </div>
                    )}

                    {medicines.map((m, idx) => (
                        <div key={idx} className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-[11px] font-[900] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-teal-600 shadow-sm">{idx + 1}</span>
                                    Thông tin thuốc
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Xóa thuốc"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tên thuốc <span className="text-rose-500">*</span></label>
                                    <MedicineSearchInput
                                        value={m.chosen}
                                        onChange={(picked) => handleMedicinePick(idx, picked)}
                                    />
                                    {!m.chosen?.id && (
                                        <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center gap-1">
                                            <Info size={12} /> Bạn chưa chọn thuốc
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Số lượng</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={1}
                                                value={m.quantity}
                                                onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hướng dẫn dùng thuốc</label>
                                        <input
                                            type="text"
                                            value={m.usage_instruction}
                                            onChange={(e) => handleChange(idx, 'usage_instruction', e.target.value)}
                                            placeholder="VD: Uống 2 viên / ngày sau ăn"
                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ghi chú thêm</label>
                                    <input
                                        type="text"
                                        value={m.note}
                                        onChange={(e) => handleChange(idx, 'note', e.target.value)}
                                        placeholder="Nhập ghi chú (optional)..."
                                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-all"
                                    />
                                </div>

                                <div className="pt-2 border-t border-gray-50 flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={m.dispensed}
                                            onChange={(e) => handleChange(idx, 'dispensed', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                        <span className="ml-3 text-sm font-bold text-gray-600">Đã cấp phát thuốc</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="group w-full py-5 border-2 border-dashed border-gray-200 rounded-[28px] text-sm text-gray-400 hover:text-teal-500 hover:border-teal-500 hover:bg-teal-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-1"
                    >
                        <Plus size={24} className="group-hover:scale-125 transition-transform" />
                        <span className="font-extrabold uppercase tracking-widest text-[11px]">Thêm thuốc vào đơn</span>
                    </button>

                    {error && (
                        <div className="animate-in shake duration-300 px-5 py-4 bg-rose-50 border border-rose-100 rounded-[20px] flex items-center gap-3 text-rose-600">
                            <Info size={18} className="shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="order-2 sm:order-1 px-8 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-extrabold text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-95 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="medicine-form"
                        disabled={isSaving}
                        className="order-1 sm:order-2 px-10 py-3 rounded-2xl bg-teal-500 text-white text-sm font-[900] hover:bg-teal-600 active:scale-95 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang lưu...</span>
                            </div>
                        ) : 'Lưu đơn thuốc'}
                    </button>
                </div>
            </div>
        </div>
    );
};
