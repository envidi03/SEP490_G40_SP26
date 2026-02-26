import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import staffService from '../../services/staffService';
import { Loader2 } from 'lucide-react';

const DoctorsList = () => {
    // Current Page State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // API States
    const [doctorsData, setDoctorsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDoctors = async () => {
            try {
                setLoading(true);
                // Call backend with the brand new query filter: role_name='DOCTOR'
                const response = await staffService.getStaffs({
                    role_name: 'DOCTOR',
                    limit: 100, // Large enough to get all doctors
                    page: 1
                });

                if (!isMounted) return;

                const allDoctors = response.data?.data || response.data || [];

                // Mapped data to UI placeholders for missing backend fields
                const formattedDoctors = allDoctors.map((doc) => ({
                    ...doc,
                    // Temporarily hardcode these missing text fields until backend supports them
                    education: 'Bác sĩ chuyên khoa Răng Hàm Mặt',
                    achievements: [
                        'Chứng chỉ hành nghề khám bệnh, chữa bệnh',
                        'Chứng chỉ đào tạo liên tục chuyên ngành Nha khoa'
                    ]
                }));

                setDoctorsData(formattedDoctors);
            } catch (err) {
                console.error("Failed to fetch doctors:", err);
                if (isMounted) {
                    setError("Không thể kết nối đến máy chủ. Vui lòng tải lại trang.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDoctors();

        return () => { isMounted = false; };
    }, []);

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

                    {/* API States Handling */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-500 text-lg">Đang tải danh sách bác sĩ...</p>
                        </div>
                    )}

                    {error && (
                        <div className="py-20 text-center min-h-[400px] flex flex-col justify-center items-center">
                            <p className="text-red-500 bg-red-50 px-6 py-4 rounded-xl text-lg mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-white bg-blue-600 hover:bg-blue-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* API Success Data Rendering */}
                    {!loading && !error && currentData.length === 0 && (
                        <div className="py-20 text-center min-h-[400px] flex items-center justify-center">
                            <p className="text-gray-500 text-xl">Hiện tại chưa có dữ liệu bác sĩ nào.</p>
                        </div>
                    )}

                    {!loading && !error && currentData.length > 0 && (
                        <>
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
                                                {doctor.profile?.full_name || 'Bác sĩ'}
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

                                            {/* Doctor Image */}
                                            <img
                                                src={doctor.profile?.avatar_url || 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'}
                                                alt={doctor.profile?.full_name || 'Bác sĩ'}
                                                className="relative z-10 w-[90%] h-auto object-cover object-bottom scale-[1.10] origin-bottom drop-shadow-sm"
                                                onError={(e) => { e.target.src = 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'; }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Options */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mb-12">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${currentPage === 1
                                            ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                            : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        &larr;
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg min-w-[40px] transition-colors ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white font-medium shadow-sm'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${currentPage === totalPages
                                            ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                            : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default DoctorsList;
