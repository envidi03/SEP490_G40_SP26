import React from 'react';
import { X, ClipboardList } from 'lucide-react';

const ServiceDetailModal = ({ show, service, onClose, formatCurrency }) => {
    if (!show || !service) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row min-h-[500px]">

                {/* Left: Visual Side (40%) */}
                <div className="md:w-[40%] bg-slate-100 relative h-64 md:h-auto overflow-hidden group">
                    {service.icon ? (
                        <>
                            <img
                                src={service.icon}
                                alt={service.service_name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 flex items-center justify-center">
                            <ClipboardList className="text-white/20" size={120} />
                        </div>
                    )}

                    {/* Badge on Image (Mobile) */}
                    <div className="absolute bottom-4 left-4 md:hidden">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-widest border border-white/30">
                            Service Detail
                        </span>
                    </div>
                </div>

                {/* Right: Content Side (60%) */}
                <div className="md:w-[60%] p-8 md:p-12 relative flex flex-col justify-center">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200 z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Content Header */}
                    <div className="mb-8">
                        <span className="hidden md:inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-[0.2em] mb-4 border border-blue-100 shadow-sm">
                            Thông tin chi tiết dịch vụ
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            {service.service_name}
                        </h2>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-blue-100 shadow-sm mb-8 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <span className="text-sm font-semibold uppercase tracking-wider">Khoảng giá dịch vụ</span>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-2xl md:text-2xl font-black text-blue-700 tracking-tight">
                                {service.calculated_min_price === service.calculated_max_price
                                    ? formatCurrency(service.calculated_min_price)
                                    : `${formatCurrency(service.calculated_min_price)} — ${formatCurrency(service.calculated_max_price)}`
                                }
                            </p>
                            {service.sub_service_count > 0 && (
                                <p className="text-xs text-blue-400 font-medium mt-1.5 italic">
                                    * Giá chính xác phụ thuộc vào gói dịch vụ và tình trạng răng miệng
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            Mô tả dịch vụ
                        </h3>
                        <div className="text-slate-600 leading-relaxed text-base md:text-lg max-h-[220px] overflow-y-auto pr-4 custom-scrollbar-thin font-medium">
                            {service.description || 'Hệ thống hiện chưa cập nhật mô tả chi tiết cho dịch vụ này. Vui lòng liên hệ trực tiếp để được tư vấn thêm.'}
                        </div>
                    </div>

                    {/* Footer / CTA (Optional) */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dịch vụ đang hoạt động</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider flex items-center gap-2"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;
