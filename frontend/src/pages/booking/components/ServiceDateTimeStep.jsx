import React, { useState, useEffect } from 'react';
import { Search, Clock, DollarSign, Loader2, Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';
import serviceService from '../../../services/serviceService';

const ServiceDateTimeStep = ({ onSelect, initialData }) => {
    // --- Service Selection Logic ---
    const [services, setServices] = useState([]); // Danh sách dịch vụ cha
    const [subServices, setSubServices] = useState([]); // Tất cả các gói dịch vụ
    const [filteredSubServices, setFilteredSubServices] = useState([]);
    const [activeParent, setActiveParent] = useState(null); // ID dịch vụ cha đang chọn để lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(initialData?.service_id ? { _id: initialData.service_id, service_name: initialData.service_name } : null);
    const [selectedSubService, setSelectedSubService] = useState(initialData?.sub_service_id ? {
        _id: initialData.sub_service_id,
        sub_service_name: initialData.sub_service_name,
        min_price: initialData.service_price
    } : null);

    // --- Date Time Picker Logic ---
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(initialData?.date || getTodayDate());
    const [selectedTime, setSelectedTime] = useState(initialData?.time || '');

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
        '22:00', '22:30'
    ];

    const getFilteredTimeSlots = () => {
        if (selectedDate !== getTodayDate()) return timeSlots;
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        return timeSlots.filter(time => {
            const [hour, minute] = time.split(':').map(Number);
            return (hour * 60 + minute) > currentTimeInMinutes + 30;
        });
    };

    const filteredTimeSlots = getFilteredTimeSlots();
    const getMinDate = () => getTodayDate();
    const getMaxDate = () => {
        const max = new Date();
        max.setMonth(max.getMonth() + 3);
        return max.toISOString().split('T')[0];
    };

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Lấy tất cả dịch vụ cha đang công tác
                const parentRes = await serviceService.getAllServices({ filter: 'AVAILABLE', limit: 100 });
                if (!isMounted) return;
                const parents = (parentRes?.data || []).filter(s => s.status === 'AVAILABLE');
                setServices(parents);

                // 2. Lấy tất cả gói dịch vụ của các dịch vụ cha này
                const subPromises = parents.map(p => serviceService.getSubServicesByParent(p._id));
                const subResponses = await Promise.all(subPromises);
                
                const allSubs = subResponses.flatMap(res => res?.data || []);
                setSubServices(allSubs);
                
                // Nếu có data ban đầu, set activeParent
                if (initialData?.service_id) {
                    setActiveParent(initialData.service_id);
                } else if (parents.length > 0) {
                    setActiveParent(parents[0]._id);
                }

            } catch (err) {
                if (isMounted) setError("Không thể tải danh sách dịch vụ.");
                console.error("Fetch booking items error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (subServices.length > 0) {
            // Trường hợp 1: Có sub_service_id từ initialData (đi từ trang detail)
            if (initialData?.sub_service_id) {
                const matchedSub = subServices.find(s => s._id === initialData.sub_service_id);
                if (matchedSub) {
                    setSelectedSubService(matchedSub);
                    // Tìm parent corresponding
                    const parentId = matchedSub.parent_id?._id || matchedSub.parent_id;
                    const matchedParent = services.find(p => p._id === parentId);
                    if (matchedParent) {
                        setSelectedService(matchedParent);
                        setActiveParent(matchedParent._id);
                    }
                }
            } 
            // Trường hợp 2: Chỉ có service_id (chưa chọn package cụ thể)
            else if (initialData?.service_id) {
                const matchedParent = services.find(p => p._id === initialData.service_id);
                if (matchedParent) {
                    setSelectedService(matchedParent);
                    setActiveParent(matchedParent._id);
                }
            }
        }
    }, [initialData?.sub_service_id, initialData?.service_id, subServices, services]);

    useEffect(() => {
        let filtered = subServices;
        
        if (searchTerm) {
            filtered = filtered.filter(s => 
                s.sub_service_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } else if (activeParent) {
            filtered = filtered.filter(s => s.parent_id === activeParent);
        }
        
        setFilteredSubServices(filtered);
    }, [searchTerm, subServices, activeParent]);

    const formatCurrency = (amount) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const handleContinue = () => {
        if (selectedService && selectedSubService && selectedDate && selectedTime) {
            onSelect(selectedService, selectedSubService, selectedDate, selectedTime);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Service Selection */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Chọn dịch vụ
                    </h3>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {/* Parent Service Categories (Tabs) */}
                    {!searchTerm && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide no-scrollbar">
                            {services.map(p => (
                                <button
                                    key={p._id}
                                    onClick={() => setActiveParent(p._id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                        activeParent === p._id ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {p.service_name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center py-8"><Loader2 className="animate-spin text-primary-600 mb-2" /></div>
                        ) : filteredSubServices.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy gói dịch vụ nào</div>
                        ) : filteredSubServices.map(s => (
                            <div
                                key={s._id}
                                onClick={() => {
                                    setSelectedSubService(s);
                                    const parent = services.find(p => p._id === s.parent_id);
                                    if (parent) setSelectedService(parent);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    selectedSubService?._id === s._id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className="font-semibold text-gray-900 mb-1">{s.sub_service_name}</div>
                                <div className="text-xs text-gray-500 mb-2 line-clamp-1">{s.description || 'Gói dịch vụ cao cấp'}</div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400 font-medium flex items-center gap-1"><Clock size={14} /> {s.duration} phút</span>
                                    <span className="text-primary-600">{formatCurrency(s.min_price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Date & Time Picker */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        Chọn ngày và giờ
                    </h3>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CalendarIcon size={18} className="text-primary-600" /> Chọn ngày
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <ClockIcon size={18} className="text-primary-600" /> Giờ khả dụng
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {filteredTimeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                                        selectedTime === time ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedSubService && selectedDate && selectedTime && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                            <h4 className="text-sm font-bold text-green-800 mb-1">Tóm tắt lựa chọn:</h4>
                            <p className="text-xs text-green-700 leading-tight font-medium">
                                {selectedService?.service_name} - {selectedSubService.sub_service_name} • {selectedDate} lúc {selectedTime}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleContinue}
                disabled={!selectedService || !selectedSubService || !selectedDate || !selectedTime}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
                Tiếp tục xác nhận
            </button>
        </div>
    );
};

export default ServiceDateTimeStep;
