import { featuredServicesData } from '../../../../utils/mockData';

const FeaturedServices = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Dịch vụ đang được yêu thích
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredServicesData.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100"
                        >
                            <div className="relative h-56 overflow-hidden">
                                {service.discount && (
                                    <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                                        {service.discount}
                                    </div>
                                )}
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{service.category}</p>
                                {service.originalPrice ? (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-400 line-through">{service.originalPrice}</p>
                                        <p className="text-lg font-bold text-red-600">{service.price}</p>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-primary-600 mb-4">{service.price}</p>
                                )}
                                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedServices;
