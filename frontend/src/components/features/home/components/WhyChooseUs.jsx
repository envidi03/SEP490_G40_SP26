import { Award, Shield, CheckCircle, Clock, Users } from 'lucide-react';

const WhyChooseUs = () => {
    const benefits = [
        {
            icon: Award,
            title: 'Bác Sĩ Giàu Kinh Nghiệm',
            description: 'Đội ngũ bác sĩ chuyên môn cao, tận tâm với nghề'
        },
        {
            icon: Shield,
            title: 'Trang Thiết Bị Hiện Đại',
            description: 'Máy móc công nghệ tiên tiến, đảm bảo chất lượng'
        },
        {
            icon: CheckCircle,
            title: 'Vệ Sinh An Toàn',
            description: 'Quy trình vô trùng nghiêm ngặt, đảm bảo an toàn'
        },
        {
            icon: Clock,
            title: 'Tiết Kiệm Thời Gian',
            description: 'Đặt lịch online, không phải chờ đợi lâu'
        },
        {
            icon: Users,
            title: 'Chăm Sóc Tận Tình',
            description: 'Phục vụ chu đáo, tư vấn nhiệt tình và thân thiện'
        }
    ];

    return (
        <section id="about" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi</h2>
                    <p className="text-xl text-gray-600">
                        Cam kết mang đến trải nghiệm chăm sóc răng miệng tốt nhất
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={24} className="text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
