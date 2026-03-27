import React, { useState, useEffect } from 'react';
import { 
    Search, Calendar, User, Phone, FileText, 
    Stethoscope, Clock, CalendarPlus, AlertCircle, Eye,
    Filter, RefreshCw, ArrowDownAZ, ArrowUpZA // Import thêm các icon mới
} from 'lucide-react';

import treatmentService from '../../../services/treatmentService'; 
import ViewDetailTreatment from './components/ViewDetailTreatment';

const ReBooking = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // State mới cho sắp xếp

    // State cho Modal View Detail
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTreatmentId, setSelectedTreatmentId] = useState(null);

    // Thêm tham số overrideParams để hỗ trợ gọi API ngay lập tức khi xóa bộ lọc
    const fetchPendingTreatments = async (overrideParams = {}) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search: searchTerm || undefined,
                filter_date: filterDate || undefined,
                status: "PLANNED",
                sort: sortOrder, 
                limit: 20,
                ...overrideParams // Ghi đè các giá trị nếu có truyền vào
            };
            
            const response = await treatmentService.getListTreatementWithAppointmentNull(params);
            const dataList = response?.data?.data || response?.data || [];
            setTreatments(dataList);
        } catch (err) {
            console.error("Lỗi lấy danh sách chờ xếp lịch:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Chỉ gọi tự động ở lần đầu render HOẶC khi thay đổi tiêu chí Sắp xếp (Sort)
    useEffect(() => {
        fetchPendingTreatments();
        // Cố tình bỏ searchTerm và filterDate ra khỏi mảng dependency để không tự động tìm
    }, [sortOrder]); 

    // Hàm xử lý khi bấm nút "Lọc"
    const handleApplyFilter = () => {
        fetchPendingTreatments();
    };

    // Hàm xử lý khi bấm nút "Xóa bộ lọc"
    const handleClearFilter = () => {
        setSearchTerm('');
        setFilterDate('');
        setSortOrder('asc');
        // Gọi API ngay lập tức với các tham số rỗng (tránh việc chờ state cập nhật)
        fetchPendingTreatments({ search: undefined, filter_date: undefined, sort: 'asc' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const handleOpenViewDetail = (id) => {
        setSelectedTreatmentId(id);
        setIsViewModalOpen(true);
    };

    const handleCloseViewDetail = () => {
        setIsViewModalOpen(false);
        setSelectedTreatmentId(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* HEADER & THANH TÌM KIẾM */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Clock className="text-orange-500" size={28} />
                        Chờ xếp lịch hẹn
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Danh sách các phiếu điều trị cần được lên lịch cho bệnh nhân
                    </p>
                </div>

                {/* Các công cụ Lọc & Tìm kiếm */}
                <div className="flex flex-wrap items-center gap-3 mt-2 xl:mt-0">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tên BN, Hồ sơ"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Bấm Enter để tìm nhanh cũng được
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} 
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium w-full md:w-56 transition-all"
                        />
                    </div>
                    <div className="relative flex-1 md:flex-none">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium w-full transition-all"
                        />
                    </div>

                    {/* Nút Lọc */}
                    <button 
                        onClick={handleApplyFilter}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm transition-all shadow-sm"
                        title="Áp dụng tìm kiếm"
                    >
                        <Filter size={18} />
                        <span className="hidden md:inline">Lọc</span>
                    </button>

                    {/* Nút Xóa bộ lọc */}
                    <button 
                        onClick={handleClearFilter}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-red-500 font-bold text-sm transition-all"
                        title="Xóa bộ lọc"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden md:inline">Xóa</span>
                    </button>

                    <div className="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>

                    {/* Nút Sort */}
                    <button 
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 font-bold text-sm transition-all border border-orange-100"
                        title="Sắp xếp theo ngày dự kiến"
                    >
                        {sortOrder === 'asc' ? <ArrowUpZA size={18} /> : <ArrowDownAZ size={18} />}
                        <span className="hidden md:inline">
                            {sortOrder === 'asc' ? 'Cũ nhất trước' : 'Mới nhất trước'}
                        </span>
                    </button>
                </div>
            </div>

            {/* TRẠNG THÁI LOADING / ERROR */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold mt-4 animate-pulse">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 font-medium">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* DANH SÁCH THẺ (GRID) */}
            {!loading && !error && treatments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <CalendarPlus className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">Không có phiếu điều trị nào đang chờ xếp lịch.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render List Treatments giữ nguyên */}
                    {treatments.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full group">
                            
                            {/* Phần đầu: Thông tin bệnh nhân */}
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                                            {item.record_info?.full_name || "Khách hàng"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                            <Phone size={14} />
                                            <span className="font-medium">{item.record_info?.phone || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">
                                    {item.phase}
                                </span>
                            </div>

                            {/* Phần giữa: Thông tin điều trị */}
                            <div className="flex-1 space-y-3 mb-5">
                                <div className="flex items-start gap-2 text-sm">
                                    <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Hồ sơ bệnh án</p>
                                        <p className="font-semibold text-slate-700">{item.record_info?.record_name || "Chưa có tên hồ sơ"}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2 text-sm">
                                    <Stethoscope size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Chỉ định điều trị (Răng: {item.tooth_position})</p>
                                        <p className="font-medium text-slate-600 line-clamp-2">{item.note || "Không có ghi chú"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Ngày dự kiến</p>
                                        <p className="font-semibold text-blue-600">{formatDate(item.planned_date)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nút hành động */}
                            <div className="flex gap-2 mt-auto">
                                <button 
                                    onClick={() => handleOpenViewDetail(item._id)}
                                    className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={18} />
                                </button>
                                <button 
                                    onClick={() => console.log("Mở modal đặt lịch cho:", item)}
                                    className="flex-1 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                                >
                                    <CalendarPlus size={18} />
                                    Lên lịch hẹn
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Popup Modal View Detail */}
            <ViewDetailTreatment 
                isOpen={isViewModalOpen} 
                onClose={handleCloseViewDetail} 
                treatmentId={selectedTreatmentId} 
            />
        </div>
    );
};

export default ReBooking;