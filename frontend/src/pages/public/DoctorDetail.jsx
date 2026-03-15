import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import staffService from '../../services/staffService';
import { Loader2 } from 'lucide-react';

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const response = await staffService.getStaffById(id);
                if (!isMounted) return;

                const rawDoctor = response.data?.data || response.data;

                // Extract profile data safely (handling mongoose ObjectId references vs populated objects)
                const doctorProfile = rawDoctor.profile || rawDoctor.profile_id || {};

                // Mapped data to UI placeholders for missing backend fields (matching DoctorsList)
                const formattedDoctor = {
                    ...rawDoctor,
                    profile: doctorProfile,
                };

                setDoctor(formattedDoctor);
            } catch (err) {
                console.error("Failed to fetch doctor detail:", err);
                if (isMounted) {
                    setError("Không thể tải thông tin bác sĩ. Vui lòng thử lại.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) {
            fetchDoctor();
        }

        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="min-h-[calc(100vh-160px)] bg-gray-50 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 text-lg">Đang tải thông tin bác sĩ...</p>
                </div>
            </PublicLayout>
        );
    }

    if (error || !doctor) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || 'Không tìm thấy thông tin bác sĩ'}
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

    return (
        <PublicLayout>
            <div className="bg-white py-8 min-h-[calc(100vh-160px)]">

                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Đội ngũ bác sĩ', path: '/doctors' },
                    { label: doctor.profile?.full_name || 'Chi tiết bác sĩ' }
                ]} />

                {/* Header Section */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12 mb-8">
                    {/* Doctor Name Heading */}
                    <h1 className="text-2xl font-bold text-[#1a2b5e] mb-2">
                        {doctor.profile?.full_name}
                    </h1>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-10 lg:gap-16">

                        {/* LEFT: Large Photo */}
                        <div className="w-full">
                            <div className="bg-[#e4e4e4] rounded-sm w-full aspect-[3/4] relative overflow-hidden flex items-end justify-center">
                                <img
                                    src={doctor.profile?.avatar_url || 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'}
                                    alt={doctor.profile?.full_name || 'Bác sĩ'}
                                    className="w-[90%] h-auto object-cover object-bottom"
                                    onError={(e) => { e.target.src = 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'; }}
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
                                        <span className="font-normal text-gray-600">{doctor.profile?.full_name}</span>
                                    </li>
                                    <li>
                                        <span className="font-bold">Khu vực: </span>
                                        <span className="font-normal text-gray-600">{doctor.profile?.address || 'Miền Bắc'}</span>
                                    </li>
                                    {doctor.licenses && doctor.licenses.length > 0 && (
                                        <li>
                                            <span className="font-bold">Chứng chỉ hành nghề: </span>
                                            <ul className="list-disc pl-5 mt-2 space-y-1 font-normal text-gray-600">
                                                {doctor.licenses.map((license, idx) => (
                                                    <li key={idx}>
                                                        {typeof license === 'string' ? license : (license.name || license.license_number || 'Chứng chỉ')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    )}
                                </ol>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </PublicLayout>
    );
};

export default DoctorDetail;
