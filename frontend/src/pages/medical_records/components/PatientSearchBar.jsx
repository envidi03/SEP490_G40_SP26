/**
 * PatientSearchBar
 * Ô tìm kiếm bệnh nhân – gọi API khi gõ (debounce ở parent)
 * Props: value, onChange, isSearching
 */
const PatientSearchBar = ({ value, onChange, isSearching }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Tìm kiếm bệnh nhân</h2>
            <p className="text-xs text-gray-400 mt-0.5">
                Nhập họ tên, số điện thoại, email hoặc ngày sinh (yyyy-mm-dd)
            </p>
        </div>
        <div className="flex items-center gap-3">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="VD: Nguyễn Văn A · 0912345678 · 1990-01-15"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                autoFocus
            />
            {isSearching && (
                <span className="text-xs text-teal-500 whitespace-nowrap">Đang tìm...</span>
            )}
        </div>
    </div>
);

export default PatientSearchBar;
