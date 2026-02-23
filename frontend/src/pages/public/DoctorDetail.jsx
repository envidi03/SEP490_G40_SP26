import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, Clock, Star, MapPin, Calendar, Phone, Mail, CheckCircle, GraduationCap } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';


const doctorsData = {
    '1': {
        id: 1,
        name: 'BS. Nguyễn Văn An',
        specialty: 'Chỉnh nha',
        education: 'Bác sĩ - Đại học Y Hà Nội',
        experience: '15 năm',
        rating: 4.9,
        reviews: 127,
        image: 'https://i.pravatar.cc/400?img=12',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên gia hàng đầu về niềng răng Invisalign và chỉnh nha mắc cài. Đã điều trị thành công hơn 500 ca phức tạp với tỷ lệ hài lòng 98%. Với kinh nghiệm hơn 15 năm trong lĩnh vực chỉnh nha, bác sĩ An đã mang lại nụ cười tự tin cho hàng nghìn bệnh nhân.',
        achievements: [
            'Chứng chỉ Invisalign Diamond Provider',
            'Giảng viên Đại học Y Hà Nội',
            'Top 10 bác sĩ chỉnh nha xuất sắc 2023',
            'Hội viên Hiệp hội Chỉnh nha Thế giới (WFO)',
            'Hơn 500 ca niềng răng thành công'
        ],
        services: [
            'Niềng răng Invisalign',
            'Niềng răng mắc cài kim loại',
            'Niềng răng mắc cài tự động',
            'Niềng răng mắc cài sứ',
            'Tư vấn chỉnh nha cho trẻ em'
        ],
        workingDays: 'Thứ 2 - Thứ 7',
        workingHours: '8:00 - 17:00',
        location: 'Phòng khám DCMS - Chi nhánh Quận 1',
        email: 'bs.nguyenvanan@dcms.vn',
        phone: '0901234567'
    },
    '2': {
        id: 2,
        name: 'TS.BS. Trần Thị Bình',
        specialty: 'Cấy ghép Implant',
        education: 'Tiến sĩ - Đại học Y Dược TP.HCM',
        experience: '18 năm',
        rating: 5.0,
        reviews: 203,
        image: 'https://i.pravatar.cc/400?img=5',
        languages: ['Tiếng Việt', 'English', '日本語'],
        description: 'Chuyên gia hàng đầu về cấy ghép implant với tỷ lệ thành công 98%. Được đào tạo bài bản tại Nhật Bản và Hàn Quốc, TS.BS Bình là một trong những bác sĩ có nhiều kinh nghiệm nhất trong lĩnh vực implant.',
        achievements: [
            'Chứng chỉ Straumann Expert',
            'Huân chương lao động hạng Nhì',
            'Hơn 2000 ca implant thành công',
            'Giảng viên cao cấp',
            'Đào tạo tại Tokyo Dental College'
        ],
        services: [
            'Cấy ghép Implant',
            'Implant All-on-4',
            'Implant All-on-6',
            'Nâng xoang hàm',
            'Ghép xương'
        ],
        workingDays: 'Thứ 3 - Chủ nhật',
        workingHours: '9:00 - 18:00',
        location: 'Phòng khám DCMS - Chi nhánh Quận 3',
        email: 'ts.tranthib inh@dcms.vn',
        phone: '0902345678'
    },
    '3': {
        id: 3,
        name: 'BS. Lê Minh Cường',
        specialty: 'Nha khoa thẩm mỹ',
        education: 'Bác sĩ - Đại học Y Dược TP.HCM',
        experience: '12 năm',
        rating: 4.8,
        reviews: 156,
        image: 'https://i.pravatar.cc/400?img=33',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên về răng sứ thẩm mỹ, dán sứ veneer và thiết kế nụ cười. Đã thực hiện hàng nghìn ca phục hình thẩm mỹ, mang lại nụ cười rạng rỡ cho khách hàng.',
        achievements: [
            'Chứng chỉ Digital Smile Design',
            'Emax Certified Specialist',
            'Best Aesthetic Dentist Award 2022',
            'Hội viên Hội Nha khoa Thẩm mỹ Châu Á'
        ],
        services: [
            'Bọc răng sứ',
            'Dán sứ Veneer',
            'Tẩy trắng răng',
            'Thiết kế nụ cười'
        ],
        workingDays: 'Thứ 2 - Thứ 6',
        workingHours: '8:00 - 17:00',
        location: 'Phòng khám DCMS - Chi nhánh Quận 1',
        email: 'bs.leminhcuong@dcms.vn',
        phone: '0903456789'
    },
    '4': {
        id: 4,
        name: 'BS. Phạm Thu Duyên',
        specialty: 'Nha khoa trẻ em',
        education: 'Bác sĩ - Đại học Y Hà Nội',
        experience: '10 năm',
        rating: 4.9,
        reviews: 189,
        image: 'https://i.pravatar.cc/400?img=9',
        languages: ['Tiếng Việt', 'English'],
        description: 'Bác sĩ chuyên khoa nhi với phong cách thân thiện, giúp trẻ em không còn sợ nha sĩ. Áp dụng các phương pháp tâm lý học hành vi và kỹ thuật không đau.',
        achievements: [
            'Chuyên khoa Nha khoa Nhi',
            'Invisalign First Provider',
            'Giải thưởng Bác sĩ thân thiện 2023',
            'Chứng chỉ Quản lý hành vi trẻ em'
        ],
        services: [
            'Điều trị sâu răng trẻ em',
            'Nhổ răng sữa',
            'Niềng răng tăng trưởng',
            'Khám định kỳ cho bé'
        ],
        workingDays: 'Thứ 2 - Chủ nhật',
        workingHours: '8:30 - 17:30',
        location: 'Phòng khám DCMS - Chi nhánh Quận 3',
        email: 'bs.phamthuduyen@dcms.vn',
        phone: '0904567890'
    },
    '5': {
        id: 5,
        name: 'TS.BS. Hoàng Văn Kiên',
        specialty: 'Nội nha - Điều trị tủy',
        education: 'Tiến sĩ - Đại học Y Hà Nội',
        experience: '20 năm',
        rating: 4.9,
        reviews: 167,
        image: 'https://i.pravatar.cc/400?img=60',
        languages: ['Tiếng Việt', 'English', 'Français'],
        description: 'Chuyên gia điều trị tủy, xử lý các ca khó và thu nhỏ. Đào tạo chuyên sâu tại Cộng hòa Pháp.',
        achievements: [
            'Chứng chỉ Endodontic Expert',
            'Giảng viên cao cấp',
            '15+ năm kinh nghiệm nội nha',
            'Báo cáo viên tại các hội nghị quốc tế'
        ],
        services: [
            'Điều trị tủy răng cửa, răng hàm',
            'Nội nha lại',
            'Vi phẫu thuật nội nha'
        ],
        workingDays: 'Thứ 2 - Thứ 6',
        workingHours: '9:00 - 16:00',
        location: 'Phòng khám DCMS - Chi nhánh Quận 1',
        email: 'ts.hoangvankien@dcms.vn',
        phone: '0905678901'
    },
    '6': {
        id: 6,
        name: 'BS. Võ Thị Hương',
        specialty: 'Phẫu thuật hàm mặt',
        education: 'Bác sĩ - Đại học Y Dược TP.HCM',
        experience: '14 năm',
        rating: 4.8,
        reviews: 98,
        image: 'https://i.pravatar.cc/400?img=20',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên về phẫu thuật nhổ răng khôn, phẫu thuật hàm mặt và chấn thương răng miệng. Thực hiện các ca tiểu phẫu chính xác, nhẹ nhàng, nhanh chóng hồi phục.',
        achievements: [
            'Chứng chỉ Oral Surgery',
            'Hơn 5000 ca phẫu thuật',
            'American Academy of Oral Surgery member',
            'Chứng chỉ cấy ghép xương'
        ],
        services: [
            'Nhổ răng khôn',
            'Phẫu thuật u nang xương hàm',
            'Phẫu thuật cắt chóp'
        ],
        workingDays: 'Thứ 2, 4, 6',
        workingHours: '8:00 - 18:00',
        location: 'Phòng khám DCMS - Chi nhánh Quận 3',
        email: 'bs.vothihuong@dcms.vn',
        phone: '0906789012'
    }
};

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const doctor = doctorsData[id];

    if (!doctor) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Không tìm thấy bác sĩ
                        </h2>
                        <button
                            onClick={() => navigate('/doctors')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Quay lại danh sách bác sĩ
                        </button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="bg-gray-50 py-8">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Đội ngũ bác sĩ', path: '/doctors' },
                    { label: doctor.name }
                ]} />

                <div className="max-w-7xl mx-auto px-4">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/doctors')}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Quay lại danh sách</span>
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Photo */}
                                    <div className="relative">
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="w-48 h-48 rounded-lg object-cover shadow-lg"
                                        />
                                        <div className="absolute -bottom-3 -right-3 bg-white px-4 py-2 rounded-full shadow-lg">
                                            <div className="flex items-center gap-1">
                                                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                                                <span className="font-bold text-gray-900 text-lg">{doctor.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                            {doctor.name}
                                        </h1>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <Award size={20} />
                                                <span className="font-semibold">{doctor.specialty}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <GraduationCap size={20} />
                                                <span>{doctor.education}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={20} />
                                                <span>{doctor.experience} kinh nghiệm</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={20} />
                                                <span>{doctor.location}</span>
                                            </div>
                                        </div>

                                        {/* Languages */}
                                        <div className="flex flex-wrap gap-2">
                                            {doctor.languages.map((lang, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-6 pt-6 border-t">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">Giới thiệu</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        {doctor.description}
                                    </p>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Award className="text-primary-600" size={28} />
                                    Thành tựu & Chứng chỉ
                                </h2>
                                <div className="space-y-3">
                                    {doctor.achievements.map((achievement, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                            <span className="text-gray-700">{achievement}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Services */}
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dịch vụ thực hiện</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {doctor.services.map((service, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                            <span>{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Summary */}
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá từ bệnh nhân</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-primary-600 mb-1">{doctor.rating}</div>
                                        <div className="text-sm text-gray-600">Điểm trung bình</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-primary-600 mb-1">{doctor.reviews}</div>
                                        <div className="text-sm text-gray-600">Đánh giá</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-primary-600 mb-1">98%</div>
                                        <div className="text-sm text-gray-600">Hài lòng</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-primary-600 mb-1">100%</div>
                                        <div className="text-sm text-gray-600">Giới thiệu</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
                                {/* Working Hours */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar size={20} className="text-primary-600" />
                                        Lịch làm việc
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{doctor.workingDays}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{doctor.workingHours}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Liên hệ</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Phone size={18} className="text-primary-600" />
                                            <a href={`tel:${doctor.phone}`} className="hover:text-primary-600">
                                                {doctor.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Mail size={18} className="text-primary-600" />
                                            <a href={`mailto:${doctor.email}`} className="hover:text-primary-600 break-all">
                                                {doctor.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Đặt lịch khám</h3>
                                    <div className="space-y-3">
                                        <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                                            📅 Đặt lịch ngay
                                        </button>
                                        <button className="w-full px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                                            💬 Chat tư vấn
                                        </button>
                                        <a
                                            href="tel:19008059"
                                            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                                        >
                                            📞 1900 8059
                                        </a>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Lưu ý:</strong> Vui lòng đặt lịch trước để được phục vụ tốt nhất.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Doctors */}
                    <div className="mt-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                            Bác sĩ cùng chuyên khoa
                        </h2>
                        <div className="text-center text-gray-600">
                            <Link to="/doctors" className="text-primary-600 hover:underline font-medium">
                                Xem tất cả bác sĩ →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default DoctorDetail;
