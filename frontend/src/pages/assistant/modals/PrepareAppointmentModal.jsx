import { X, CheckCircle, Package, Laptop, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const PrepareAppointmentModal = ({ appointment, isOpen, onClose, onComplete }) => {
    // Vật tư tiêu hao (Supplies)
    const [supplies, setSupplies] = useState({
        tray: false,
        gauze: false,
        syringe: false,
        anesthesia: false,
        gloves: false,
        masks: false
    });

    // Máy móc (Equipment)
    const [equipment, setEquipment] = useState({
        chair: null,      // null | 'good' | 'error'
        light: null,
        suction: null,
        xray: null
    });

    const [notes, setNotes] = useState('');

    if (!isOpen || !appointment) return null;

    const suppliesLabels = {
        tray: 'Khay khám cơ bản',
        gauze: 'Bông băng, gạc y tế',
        syringe: 'Kim tiêm vô trùng',
        anesthesia: 'Thuốc tê chuyên dụng',
        gloves: 'Găng tay y tế',
        masks: 'Khẩu trang chuyên dụng'
    };

    const equipmentLabels = {
        chair: 'Ghế răng số 1',
        light: 'Đèn soi nha khoa',
        suction: 'Máy hút bọt (suction)',
        xray: 'Máy chụp X-Quang'
    };

    const handleSupplyChange = (key) => {
        setSupplies(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleEquipmentChange = (key, status) => {
        setEquipment(prev => ({ ...prev, [key]: status }));
    };

    const checkedSupplies = Object.values(supplies).filter(Boolean).length;
    const checkedEquipment = Object.values(equipment).filter(v => v !== null).length;

    // Total items: 6 supplies + 4 equipment = 10 items
    const totalSupplies = Object.keys(supplies).length;
    const totalEquipment = Object.keys(equipment).length;
    const totalItems = totalSupplies + totalEquipment;

    const progress = checkedSupplies + checkedEquipment;
    const progressPercent = Math.round((progress / totalItems) * 100);
    const isReadyToConfirm = progress === totalItems;
    const hasError = Object.values(equipment).some(v => v === 'error');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isReadyToConfirm) return;

        const data = {
            supplies,
            equipment,
            notes,
            hasError,
            completedAt: new Date().toISOString()
        };
        if (onComplete) {
            onComplete(appointment.id, data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Chuẩn Bị Ca Khám</h2>
                            <p className="text-sm text-gray-500">Bệnh nhân: <span className="font-semibold text-gray-700">{appointment.patientName}</span> - Dịch vụ: <span className="font-semibold text-gray-700">{appointment.reason}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar Container */}
                <div className="px-6 py-4 bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Tiến độ chuẩn bị vật tư & thiết bị</span>
                        <span className={`font-bold ${isReadyToConfirm ? 'text-green-600' : 'text-blue-600'}`}>
                            {progress}/{totalItems} mục ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${isReadyToConfirm
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                                }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Body (Scrollable Checklist) */}
                <div className="overflow-y-auto flex-1 p-6 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cột 1: Vật tư tiêu hao (Supplies) */}
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 uppercase tracking-wide text-sm">
                                <Package className="text-blue-500" size={18} />
                                Vật tư tiêu hao ({checkedSupplies}/{totalSupplies})
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(suppliesLabels).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${supplies[key]
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={supplies[key]}
                                            onChange={() => handleSupplyChange(key)}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-white"
                                        />
                                        <span className={`text-[15px] ${supplies[key] ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cột 2: Máy móc (Equipment) */}
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 uppercase tracking-wide text-sm">
                                <Laptop className="text-amber-500" size={18} />
                                Máy móc ({checkedEquipment}/{totalEquipment})
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(equipmentLabels).map(([key, label]) => {
                                    const status = equipment[key];
                                    return (
                                        <div
                                            key={key}
                                            className={`p-3.5 border-2 rounded-xl transition-all duration-200 ${status === 'good'
                                                ? 'bg-green-50 border-green-200 shadow-sm'
                                                : status === 'error'
                                                    ? 'bg-red-50 border-red-200 shadow-sm'
                                                    : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <div className={`font-medium mb-3 text-[15px] ${status === 'good' ? 'text-green-800' : status === 'error' ? 'text-red-800' : 'text-gray-700'}`}>
                                                {label}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEquipmentChange(key, 'good')}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${status === 'good'
                                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Hoạt động Tốt
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEquipmentChange(key, 'error')}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5 ${status === 'error'
                                                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {status === 'error' && <AlertTriangle size={14} />}
                                                    Có lỗi
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm (Nếu có thiết bị lỗi, hãy ghi rõ)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                            placeholder="Ghi chú về tình trạng chuẩn bị..."
                        />

                        {/* Warning banner if there's an error */}
                        {hasError && (
                            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                                <AlertTriangle size={18} className="shrink-0" />
                                <span><strong>Lưu ý:</strong> Có thiết bị đang báo lỗi. Việc xác nhận sẽ đồng thời gửi báo cáo bảo trì tự động.</span>
                            </div>
                        )}

                        {/* Success banner if completely ready and no errors */}
                        {isReadyToConfirm && !hasError && (
                            <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm border border-green-100">
                                <CheckCircle size={18} className="shrink-0" />
                                <span>Tất cả hạng mục đã sẵn sàng. Bạn có thể nhấn Xác nhận hoàn thành.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isReadyToConfirm}
                        className={`px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 ${isReadyToConfirm
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 transform hover:-translate-y-[1px]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Trạng thái: Sẵn sàng
                        <CheckCircle size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrepareAppointmentModal;
