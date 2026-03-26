import React, { useState, useEffect, useRef } from "react";
import { Trash2, Search, X, Info, Pill } from "lucide-react";
import inventoryService from "../../../../services/inventoryService";

// ─── Searchable Medicine Picker ───────────────────────────────────────────────
const MedicineSearchInput = ({ value, onChange }) => {
  const [query, setQuery] = useState(value?.medicine_name || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync khi value thay đổi từ bên ngoài (vd: load dữ liệu cũ)
  useEffect(() => {
    if (value?.medicine_name) setQuery(value.medicine_name);
    else if (value === null) setQuery("");
  }, [value]);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await inventoryService.getMedicines({
          search: q,
          limit: 10,
          status: "AVAILABLE",
        });
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
    onChange({
      id: med._id,
      medicine_name: med.medicine_name,
      unit: med.unit,
    });
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative group">
        <Search
          size={15}
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? "text-blue-500" : "text-slate-400"
            }`}
        />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="Tìm tên thuốc..."
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown kết quả */}
      {isOpen && (
        <div className="absolute z-[80] w-full mt-1.5 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {isSearching && (
              <div className="flex flex-col items-center py-5">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">
                  Đang tìm kiếm...
                </p>
              </div>
            )}
            {!isSearching && results.length === 0 && query.length > 0 && (
              <div className="py-6 px-4 text-center">
                <Info size={22} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">
                  Không tìm thấy "{query}"
                </p>
              </div>
            )}
            {results.map((med) => (
              <button
                key={med._id}
                type="button"
                onMouseDown={() => handleSelect(med)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 group"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pill size={13} className="text-blue-400 shrink-0" />
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                      {med.medicine_name}
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                    {med.unit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 ml-5 mt-0.5">
                  Tồn kho:{" "}
                  <span
                    className={
                      med.quantity <= 0
                        ? "text-rose-500 font-bold"
                        : "text-emerald-600 font-bold"
                    }
                  >
                    {med.quantity}
                  </span>
                  {med.dosage_form && (
                    <span className="ml-2 text-slate-300">•</span>
                  )}
                  {med.dosage_form && (
                    <span className="ml-1">{med.dosage_form}</span>
                  )}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Medicine Row Component ──────────────────────────────────────────────
const MedicineModal = ({ med, handleMedicineChange, handleRemoveMedicine }) => {
  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative">
      <button
        type="button"
        onClick={() => handleRemoveMedicine(med._localId)}
        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
        title="Xóa thuốc"
      >
        <Trash2 size={14} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Tìm kiếm & chọn thuốc */}
        <div className="md:col-span-8 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Thuốc <span className="text-red-500">*</span>
          </label>
          <MedicineSearchInput
            value={
              med.medicine_id
                ? { id: med.medicine_id, medicine_name: med._medicine_name || "" }
                : null
            }
            onChange={(picked) => {
              handleMedicineChange(
                med._localId,
                "medicine_id",
                picked ? picked.id : ""
              );
              handleMedicineChange(
                med._localId,
                "_medicine_name",
                picked ? picked.medicine_name : ""
              );
            }}
          />
          {!med.medicine_id && (
            <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 ml-1">
              <Info size={11} /> Chưa chọn thuốc
            </p>
          )}
        </div>

        {/* Số lượng */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={med.quantity}
            onChange={(e) =>
              handleMedicineChange(med._localId, "quantity", e.target.value)
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 text-sm"
          />
        </div>

        {/* Hướng dẫn uống */}
        <div className="md:col-span-12 space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Hướng dẫn uống
          </label>
          <input
            type="text"
            value={med.usage_instruction}
            onChange={(e) =>
              handleMedicineChange(
                med._localId,
                "usage_instruction",
                e.target.value
              )
            }
            placeholder="VD: Ngày uống 2 lần, mỗi lần 1 viên sau ăn..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicineModal;