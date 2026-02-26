import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Mock doctors data
const doctorsData = [
    {
        _id: '1',
        profile_id: {
            full_name: 'Nguyễn Thị Mỹ Anh',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ hành nghề Đại học Y Hà Nội',
            'Chứng chỉ chỉnh nha không mắc cài invisalign của Mỹ'
        ]
    },
    {
        _id: '2',
        profile_id: {
            full_name: 'Ninh Duy Minh',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ chỉnh nha không mắc cài invisalign của Mỹ',
            'Chứng chỉ SSP Chỉnh phục không gian mão răng'
        ]
    },
    {
        _id: '3',
        profile_id: {
            full_name: 'Đặng Thị Thu Hằng',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ chỉnh nha không mắc cài invisalign của Mỹ'
        ]
    },
    {
        _id: '4',
        profile_id: {
            full_name: 'Vũ Trà My',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Hoàn thành chương trình Progress Orthodontic Seminars – Hoa Kỳ'
        ]
    },
    {
        _id: '5',
        profile_id: {
            full_name: 'Vũ Đức Dũng',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt – Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ đào tạo chuyên môn về trồng răng implant – Đại học Y Hà Nội',
            'Chứng chỉ Master class của invisalign trong điều trị những ca nhổ răng do bs Hiroshi Samoto – Nhật Bản hướng dẫn'
        ]
    },
    {
        _id: '6',
        profile_id: {
            full_name: 'Đặng Thị Phương Hoa',
            avatar_url: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'
        },
        education: 'Bác sĩ chuyên ngành Răng Hàm Mặt tại Đại học Y Hà Nội',
        achievements: [
            'Chứng chỉ niềng răng trong suốt invisalign'
        ]
    }
];

const DoctorsList = () => {
    // Current Page State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Total pages calculation
    const totalPages = Math.ceil(doctorsData.length / itemsPerPage);

    // Pagination data
    const currentData = doctorsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <PublicLayout>
            <div className="bg-gray-50 py-8 min-h-[calc(100vh-160px)]">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Đội ngũ bác sĩ' }
                ]} />

                <div className="max-w-7xl mx-auto px-4 mt-6">

                    {/* Header: Result count */}
                    <div className="mb-8">
                        <p className="text-gray-600">
                            Tìm thấy <span className="font-semibold text-gray-900">{doctorsData.length} kết quả</span>
                        </p>
                    </div>

                    {/* Doctors Grid: 2 columns matching design */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 mb-12">
                        {currentData.map(doctor => (
                            <div
                                key={doctor._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                {/* Left Content */}
                                <div className="flex-1 sm:pr-6 z-10 flex flex-col items-start justify-center">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                                        BÁC SĨ
                                    </div>
                                    <h3 className="text-[22px] font-bold text-[#2d3e6e] mb-4">
                                        {doctor.profile_id?.full_name}
                                    </h3>

                                    <ul className="space-y-2.5 mb-6 text-sm text-gray-600">
                                        <li className="flex items-start gap-2.5">
                                            <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                                            <span>{doctor.education}</span>
                                        </li>
                                        {doctor.achievements?.map((ach, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                                                <span className="leading-relaxed">{ach}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <Link
                                            to={`/doctor/${doctor._id}`}
                                            className="inline-flex items-center justify-center px-6 py-2 bg-blue-50 hover:bg-blue-100 text-[#4a72d4] font-medium text-sm rounded-full transition-colors"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Image (Decorations mapping exact layout) */}
                                <div className="mt-6 sm:mt-0 w-[140px] sm:w-[180px] flex-shrink-0 self-center sm:self-end relative flex items-end justify-center">
                                    {/* Light blue blob/circle in background */}
                                    <div className="absolute bottom-0 w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-blue-50 rounded-full left-1/2 -translate-x-1/2 z-0"></div>

                                    {/* Small floating blue dot on left */}
                                    <div className="absolute top-[30%] -left-4 w-6 h-6 bg-[#8db3e8] rounded-full z-10"></div>

                                    {/* Doctor Image (simulate cutout by object-cover) */}
                                    <img
                                        src={doctor.profile_id?.avatar_url}
                                        alt={doctor.profile_id?.full_name}
                                        className="relative z-10 w-full h-auto object-cover object-bottom rounded-b-full scale-[1.15] origin-bottom drop-shadow-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            {[...Array(totalPages)].map((_, idx) => {
                                const page = idx + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentPage === page
                                            ? 'bg-[#2d3e6e] text-white shadow-md'
                                            : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </PublicLayout>
    );
};

export default DoctorsList;
