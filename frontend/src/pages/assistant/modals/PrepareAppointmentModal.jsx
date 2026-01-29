import { X, CheckCircle, Wrench, Package } from 'lucide-react';
import { useState } from 'react';

const PrepareAppointmentModal = ({ appointment, isOpen, onClose, onComplete }) => {
    const [checklist, setChecklist] = useState({
        equipment: {
            dentalChair: false,
            instruments: false,
            xrayMachine: false,
            suction: false
        },
        supplies: {
            gloves: false,
            masks: false,
            gauze: false,
            anesthesia: false
        },
        hygiene: {
            sterilization: false,
            disinfection: false,
            areaPrep: false
        }
    });

    const [notes, setNotes] = useState('');

    if (!isOpen || !appointment) return null;

    const handleCheckboxChange = (category, item) => {
        setChecklist(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [item]: !prev[category][item]
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            checklist,
            notes,
            completedAt: new Date().toISOString()
        };
        if (onComplete) {
            onComplete(appointment.id, data);
        }
        onClose();
    };

    const isAllChecked = () => {
        return Object.values(checklist).every(category =>
            Object.values(category).every(item => item === true)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Chuẩn Bị Ca Khám</h2>
                            <p className="text-sm text-gray-500">Checklist thiết bị & vật tư</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Appointment Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-blue-600 font-medium">Bệnh nhân:</span>
                            <span className="ml-2 text-blue-900">{appointment.patientName}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">Thời gian:</span>
                            <span className="ml-2 text-blue-900">{appointment.date} - {appointment.time}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-blue-600 font-medium">Bác sĩ:</span>
                            <span className="ml-2 text-blue-900">{appointment.doctorName}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Equipment Checklist */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Wrench size={18} className="text-gray-600" />
                            Kiểm Tra Thiết Bị
                        </h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.equipment.dentalChair}
                                    onChange={() => handleCheckboxChange('equipment', 'dentalChair')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Ghế nha khoa hoạt động tốt</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.equipment.instruments}
                                    onChange={() => handleCheckboxChange('equipment', 'instruments')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Dụng cụ khám đã tiệt trùng</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.equipment.xrayMachine}
                                    onChange={() => handleCheckboxChange('equipment', 'xrayMachine')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Máy X-quang sẵn sàng</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.equipment.suction}
                                    onChange={() => handleCheckboxChange('equipment', 'suction')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Máy hút hoạt động bình thường</span>
                            </label>
                        </div>
                    </div>

                    {/* Supplies Checklist */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Package size={18} className="text-gray-600" />
                            Vật Tư Y Tế
                        </h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.supplies.gloves}
                                    onChange={() => handleCheckboxChange('supplies', 'gloves')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Găng tay y tế</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.supplies.masks}
                                    onChange={() => handleCheckboxChange('supplies', 'masks')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Khẩu trang</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.supplies.gauze}
                                    onChange={() => handleCheckboxChange('supplies', 'gauze')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Băng gạc, bông</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.supplies.anesthesia}
                                    onChange={() => handleCheckboxChange('supplies', 'anesthesia')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Thuốc tê (nếu cần)</span>
                            </label>
                        </div>
                    </div>

                    {/* Hygiene Checklist */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-gray-600" />
                            Vệ Sinh & Khử Trùng
                        </h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.hygiene.sterilization}
                                    onChange={() => handleCheckboxChange('hygiene', 'sterilization')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Dụng cụ đã tiệt trùng</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.hygiene.disinfection}
                                    onChange={() => handleCheckboxChange('hygiene', 'disinfection')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Khu vực khám đã khử trùng</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.hygiene.areaPrep}
                                    onChange={() => handleCheckboxChange('hygiene', 'areaPrep')}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">Phòng khám sạch sẽ, ngăn nắp</span>
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú thêm
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Ghi chú về tình trạng chuẩn bị, vấn đề gặp phải..."
                        />
                    </div>

                    {/* Progress Indicator */}
                    {isAllChecked() && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">
                                ✅ Tất cả các hạng mục đã được kiểm tra đầy đủ!
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!isAllChecked()}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${isAllChecked()
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle size={18} />
                            Xác Nhận Hoàn Thành
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrepareAppointmentModal;
