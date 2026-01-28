import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Award, Clock, Star } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Mock doctors data
const doctorsData = [
    {
        id: 1,
        name: 'BS. Nguyễn Văn An',
        specialty: 'Chỉnh nha',
        education: 'Bác sĩ - Đại học Y Hà Nội',
        experience: '15 năm',
        rating: 4.9,
        reviews: 127,
        image: 'https://i.pravatar.cc/300?img=12',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên gia hàng đầu về niềng răng Invisalign và chỉnh nha mắc cài. Đã điều trị thành công hơn 500 ca phức tạp.',
        achievements: [
            'Chứng chỉ Invisalign Diamond Provider',
            'Giảng viên Đại học Y Hà Nội',
            'Top 10 bác sĩ chỉnh nha xuất sắc 2023'
        ]
    },
    {
        id: 2,
        name: 'TS.BS. Trần Thị Bình',
        specialty: 'Cấy ghép Implant',
        education: 'Tiến sĩ - Đại học Y Dược TP.HCM',
        experience: '18 năm',
        rating: 5.0,
        reviews: 203,
        image: 'https://i.pravatar.cc/300?img=5',
        languages: ['Tiếng Việt', 'English', '日本語'],
        description: 'Chuyên gia cấy ghép implant với tỷ lệ thành công 98%. Đào tạo tại Nhật Bản và Hàn Quốc.',
        achievements: [
            'Chứng chỉ Straumann Expert',
            'Huân chương lao động hạng Nhì',
            'Hơn 2000 ca implant thành công'
        ]
    },
    {
        id: 3,
        name: 'BS. Lê Minh Cường',
        specialty: 'Nha khoa thẩm mỹ',
        education: 'Bác sĩ - Đại học Y Dược TP.HCM',
        experience: '12 năm',
        rating: 4.8,
        reviews: 156,
        image: 'https://i.pravatar.cc/300?img=33',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên về răng sứ thẩm mỹ, dán sứ veneer và thiết kế nụ cười. Đã thực hiện hàng nghìn ca phục hình thẩm mỹ.',
        achievements: [
            'Chứng chỉ Digital Smile Design',
            'Emax Certified Specialist',
            'Best Aesthetic Dentist Award 2022'
        ]
    },
    {
        id: 4,
        name: 'BS. Phạm Thu Duyên',
        specialty: 'Nha khoa trẻ em',
        education: 'Bác sĩ - Đại học Y Hà Nội',
        experience: '10 năm',
        rating: 4.9,
        reviews: 189,
        image: 'https://i.pravatar.cc/300?img=9',
        languages: ['Tiếng Việt', 'English'],
        description: 'Bác sĩ chuyên khoa nhi với phong cách thân thiện, giúp trẻ em không còn sợ nha sĩ.',
        achievements: [
            'Chuyên khoa Nha khoa Nhi',
            'Invisalign First Provider',
            'Giải thưởng Bác sĩ thân thiện 2023'
        ]
    },
    {
        id: 5,
        name: 'TS.BS. Hoàng Văn Kiên',
        specialty: 'Nội nha - Điều trị tủy',
        education: 'Tiến sĩ - Đại học Y Hà Nội',
        experience: '20 năm',
        rating: 4.9,
        reviews: 167,
        image: 'https://i.pravatar.cc/300?img=60',
        languages: ['Tiếng Việt', 'English', 'Français'],
        description: 'Chuyên gia điều trị tủy, xử lý các ca khó và thu nhỏ. Đào tạo tại Pháp.',
        achievements: [
            'Chứng chỉ Endodontic Expert',
            'Giảng viên cao cấp',
            '15+ năm kinh nghiệm nội nha'
        ]
    },
    {
        id: 6,
        name: 'BS. Võ Thị Hương',
        specialty: 'Phẫu thuật hàm mặt',
        education: 'Bác sĩ - Đại học Y Dược TP.HCM',
        experience: '14 năm',
        rating: 4.8,
        reviews: 98,
        image: 'https://i.pravatar.cc/300?img=20',
        languages: ['Tiếng Việt', 'English'],
        description: 'Chuyên về phẫu thuật nhổ răng khôn, phẫu thuật hàm mặt và chấn thương răng miệng.',
        achievements: [
            'Chứng chỉ Oral Surgery',
            'Hơn 5000 ca phẫu thuật',
            'American Academy of Oral Surgery member'
        ]
    }
];

const specialties = [
    'Tất cả',
    'Chỉnh nha',
    'Cấy ghép Implant',
    'Nha khoa thẩm mỹ',
    'Nha khoa trẻ em',
    'Nội nha - Điều trị tủy',
    'Phẫu thuật hàm mặt'
];

const DoctorsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');

    const filteredDoctors = doctorsData.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'Tất cả' || doctor.specialty === selectedSpecialty;

        return matchesSearch && matchesSpecialty;
    });

    return (
        <PublicLayout>
            <div className="bg-gray-50 py-8">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Đội ngũ bác sĩ' }
                ]} />

                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Đội Ngũ Bác Sĩ Chuyên Nghiệp
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với nghề, cam kết mang đến dịch vụ nha khoa tốt nhất
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bác sĩ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {/* Specialty Filter */}
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {specialties.map(specialty => (
                                    <option key={specialty} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Tìm thấy <span className="font-semibold text-primary-600">{filteredDoctors.length}</span> bác sĩ
                        </p>
                    </div>

                    {/* Doctors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredDoctors.map(doctor => (
                            <div key={doctor.id} className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                {/* Doctor Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                                        <div className="flex items-center gap-1">
                                            <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                            <span className="font-semibold text-gray-900">{doctor.rating}</span>
                                            <span className="text-gray-500 text-sm">({doctor.reviews})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctor Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {doctor.name}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-primary-600">
                                            <Award size={16} />
                                            <span className="text-sm font-medium">{doctor.specialty}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock size={16} />
                                            <span className="text-sm">{doctor.experience} kinh nghiệm</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {doctor.description}
                                    </p>

                                    {/* Languages */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {doctor.languages.map((lang, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                            Đặt lịch
                                        </button>
                                        <Link
                                            to={`/doctor/${doctor.id}`}
                                            className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                                        >
                                            Chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredDoctors.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">👨‍⚕️</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Không tìm thấy bác sĩ nào
                            </h3>
                            <p className="text-gray-600">
                                Thử tìm kiếm với từ khóa khác hoặc chọn chuyên khoa khác
                            </p>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Cần tư vấn về dịch vụ nha khoa?
                        </h2>
                        <p className="text-lg mb-8 opacity-90">
                            Đội ngũ bác sĩ luôn sẵn sàng tư vấn và giải đáp mọi thắc mắc của bạn
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
                                📞 Hotline: 1900 8059
                            </button>
                            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition-colors font-semibold text-lg">
                                💬 Chat tư vấn ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default DoctorsList;
