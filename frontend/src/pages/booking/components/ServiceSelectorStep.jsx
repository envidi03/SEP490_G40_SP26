import React, { useState, useEffect } from 'react';
import { Search, Clock, DollarSign, Loader2 } from 'lucide-react';
import serviceService from '../../../../services/serviceService';

const ServiceSelectorStep = ({ onSelect }) => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await serviceService.getAllServices({ status: 'AVAILABLE' });
                if (!isMounted) return;

                const activeServices = response?.data?.data || response?.data || [];
                setServices(activeServices);
                setFilteredServices(activeServices);
            } catch (err) {
                console.error("Failed to fetch services layout:", err);
                if (isMounted) setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchServices();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let filtered = services;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredServices(filtered);
    }, [searchTerm, services]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn dịch vụ khám</h2>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {loading && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                        <p className="text-gray-500">Đang tải danh sách dịch vụ...</p>
                    </div>
                )}

                {error && (
                    <div className="col-span-2 text-center py-8">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {!loading && !error && filteredServices.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                        Không tìm thấy dịch vụ phù hợp
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div
                            key={service._id}
                            onClick={() => onSelect(service)}
                            className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {service.service_name}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {service.description}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock size={16} />
                                    <span>{service.duration} phút</span>
                                </div>
                                <div className="flex items-center gap-1 text-primary-600 font-semibold">
                                    <DollarSign size={16} />
                                    <span>{formatCurrency(service.price)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServiceSelectorStep;
