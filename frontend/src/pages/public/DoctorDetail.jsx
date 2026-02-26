import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Mock doctors data (Matching DoctorsList data structure for consistency)
const doctorsData = [
    {
        _id: '1',
        profile_id: {
            full_name: 'Nguyễn Thị Mỹ Anh',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ hành nghề Đại học Y Hà Nội',
            'Chứng chỉ chỉnh nha không mắc cài invisalign của Mỹ'
        ],
        educationDetails: [
            'Tốt nghiệp Đại học Y Hà Nội khoa Răng Hàm Mặt năm 2016',
            'Hoàn thành khoá đào tạo chỉnh nha đương đại – ThS BS Hoàng Tuấn Anh năm 2018',
            'Hoàn thành chương trình Progress Orthodontic Seminars – Hoa Kỳ năm 2019',
            'Chứng chỉ chỉnh nha không mắc cài Invisalign của Mỹ'
        ],
        otherCertificates: [
            'Bằng tốt nghiệp Đại Học Y Hà Nội năm 2016',
            'Chứng chỉ hành nghề do Sở Y Tế HN cấp năm 2020',
            'Chứng chỉ đào tạo liên tục chỉnh nha do Sở Y Tế TPHCM cấp năm 2020',
            'Chứng chỉ đào tạo liên tục Cấy ghép Implant của Bệnh viện Việt Nam – Cuba năm 2019',
            'Chứng chỉ phiên dịch Y Khoa của Đại học Y Hà Nội năm 2019'
        ]
    },
    {
        _id: '4',
        profile_id: {
            full_name: 'Vũ Trà My',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Hoàn thành chương trình Progress Orthodontic Seminars – Hoa Kỳ'
        ],
        educationDetails: [
            'Tốt nghiệp Đại học Y Hà Nội khoa Răng Hàm Mặt năm 2016',
            'Hoàn thành khoá đào tạo chỉnh nha đương đại – ThS BS Hoàng Tuấn Anh năm 2018',
            'Hoàn thành chương trình Progress Orthodontic Seminars – Hoa Kỳ năm 2019',
            'Chứng chỉ chỉnh nha không mắc cài Invisalign của Mỹ'
        ],
        otherCertificates: [
            'Bằng tốt nghiệp Đại Học Y Hà Nội năm 2016',
            'Chứng chỉ hành nghề do Sở Y Tế HN cấp năm 2020',
            'Chứng chỉ đào tạo liên tục chỉnh nha do Sở Y Tế TPHCM cấp năm 2020',
            'Chứng chỉ đào tạo liên tục Cấy ghép Implant của Bệnh viện Việt Nam – Cuba năm 2019',
            'Chứng chỉ phiên dịch Y Khoa của Đại học Y Hà Nội năm 2019'
        ]
    },
    // Adding dummy fallback for other IDs if accessed directly
    {
        _id: '2',
        profile_id: {
            full_name: 'Ninh Duy Minh',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        educationDetails: ['Tốt nghiệp Đại học Y Hà Nội'],
        otherCertificates: ['Chứng chỉ hành nghề nha khoa']
    },
    {
        _id: '3',
        profile_id: {
            full_name: 'Đặng Thị Thu Hằng',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        educationDetails: ['Tốt nghiệp Đại học Y Hà Nội'],
        otherCertificates: ['Chứng chỉ hành nghề nha khoa']
    },
    {
        _id: '5',
        profile_id: {
            full_name: 'Vũ Đức Dũng',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        educationDetails: ['Tốt nghiệp Đại học Y Hà Nội'],
        otherCertificates: ['Chứng chỉ trồng răng implant']
    },
    {
        _id: '6',
        profile_id: {
            full_name: 'Đặng Thị Phương Hoa',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            address: 'Miền Bắc'
        },
        educationDetails: ['Tốt nghiệp Đại học Y Hà Nội'],
        otherCertificates: ['Chứng chỉ niềng răng trong suốt']
    }
];

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find doctor by ID, fallback to Vũ Trà My (id: '4') to match the example screenshot if not found
    let doctor = doctorsData.find(d => d._id === id);
    if (!doctor) {
        doctor = doctorsData.find(d => d._id === '4'); // Default mock profile
    }

    if (!doctor) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Không tìm thấy bác sĩ
                        </h2>
                        <button
                            onClick={() => navigate('/doctors')}
                            className="px-6 py-3 bg-[#2d3e6e] text-white rounded-lg hover:bg-[#1f2d52]"
                        >
                            Quay lại danh sách bác sĩ
                        </button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    // Default arrays if missing
    const edDetails = doctor.educationDetails || [];
    const certDetails = doctor.otherCertificates || [];

    return (
        <PublicLayout>
            <div className="bg-white py-8 min-h-[calc(100vh-160px)]">

                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Đội ngũ bác sĩ', path: '/doctors' },
                    { label: doctor.profile_id?.full_name || 'Chi tiết bác sĩ' }
                ]} />

                {/* Header Section */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12 mb-8">
                    {/* Doctor Name Heading */}
                    <h1 className="text-2xl font-bold text-[#1a2b5e] mb-2">
                        {doctor.profile_id?.full_name}
                    </h1>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-10 lg:gap-16">

                        {/* LEFT: Large Photo */}
                        <div className="w-full">
                            <div className="bg-[#e4e4e4] rounded-sm w-full aspect-[3/4] relative overflow-hidden flex items-end justify-center">
                                <img
                                    src={doctor.profile_id?.avatar_url}
                                    alt={doctor.profile_id?.full_name}
                                    className="w-[90%] h-auto object-cover object-bottom"
                                    // Use higher quality realistic avatar if needed to match design exactly
                                    onError={(e) => { e.target.src = 'https://i.pravatar.cc/600?img=' + (parseInt(doctor._id) * 10 || 12); }}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Detailed Information */}
                        <div className="w-full font-sans text-gray-800 self-start pt-2">
                            <h2 className="text-base font-bold mb-6 text-gray-800">Thông tin bác sĩ</h2>

                            <div className="space-y-6">
                                {/* Basic Info List */}
                                <ol className="list-decimal pl-5 space-y-2 font-bold text-[15px]">
                                    <li>
                                        <span className="font-bold">Họ và tên: </span>
                                        <span className="font-normal text-gray-600">{doctor.profile_id?.full_name}</span>
                                    </li>
                                    <li>
                                        <span className="font-bold">Khu vực: </span>
                                        <span className="font-normal text-gray-600">{doctor.profile_id?.address || 'Miền Bắc'}</span>
                                    </li>
                                    <li>
                                        <span className="font-bold">Học vấn</span>
                                    </li>
                                </ol>

                                {/* Education Details Bullet List */}
                                <ul className="list-disc pl-5 mt-4 space-y-2 text-[15px] font-normal leading-relaxed text-gray-700">
                                    {edDetails.map((detail, idx) => (
                                        <li key={idx}>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>

                                {/* Certificates Sub-heading */}
                                <div className="pl-5 pt-2">
                                    <h3 className="font-bold text-[15px]">4.Các chứng chỉ khác:</h3>
                                </div>

                                {/* Certificates Bullet List */}
                                <ul className="list-disc pl-5 mt-4 space-y-2 text-[15px] font-normal leading-relaxed text-gray-700">
                                    {certDetails.map((cert, idx) => (
                                        <li key={idx}>
                                            {cert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </PublicLayout>
    );
};

export default DoctorDetail;
