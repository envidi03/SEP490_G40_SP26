import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import serviceService from '../../../../services/serviceService';
import { Loader2 } from 'lucide-react';

const ServicesGallery = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                setLoading(true);
                // Fetch active services without limit
                const response = await serviceService.getAllServices({ status: 'AVAILABLE' });
                if (!isMounted) return;

                const allServices = response?.data?.data || response?.data || [];
                setServices(allServices);
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

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Chăm sóc sức khỏe răng miệng toàn diện
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[200px]">
                    {loading && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                            <p className="text-gray-500">Đang tải danh sách dịch vụ...</p>
                        </div>
                    )}

                    {error && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && services.length === 0 && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">Hiện tại chưa có dịch vụ nào.</p>
                        </div>
                    )}

                    {!loading && !error && services.map((service) => (
                        <div
                            key={service._id || Math.random()}
                            onClick={() => navigate(`/service/${service._id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100 flex items-center justify-center">
                                <img
                                    src={service.icon || 'https://via.placeholder.com/300x300.png?text=Dịch+Vụ'}
                                    alt={service.service_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300.png?text=Dịch+Vụ'; }}
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900 px-2 line-clamp-2" title={service.service_name}>
                                {service.service_name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGallery;
