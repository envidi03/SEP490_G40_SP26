import { servicesGalleryData } from '../../../../utils/mockData';

const ServicesGallery = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Chăm sóc sức khỏe răng miệng toàn diện
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {servicesGalleryData.map((service, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src={service.image}
                                    alt={`${service.title} ${service.subtitle || ''}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">
                                {service.title}
                                {service.subtitle && (
                                    <>
                                        <br />
                                        {service.subtitle}
                                    </>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGallery;
