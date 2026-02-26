import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockPatients } from '../../utils/mockData';
import PatientInfoCard from './components/PatientInfoCard';
import RecordForm from './components/RecordForm';
import useAuth from '../../contexts/AuthContext';

const CreateRecord = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Simulate fetching patient data
        const foundPatient = mockPatients.find(p => p.id === id);
        if (foundPatient) {
            setPatient(foundPatient);
        } else {
            // Handle not found
            console.error('Patient not found');
        }
        setLoading(false);
    }, [id]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Tạo hồ sơ thành công!');
            navigate('/dentist-patients'); // Redirect back to patient list
        } catch (error) {
            console.error('Error creating record:', error);
            alert('Có lỗi xảy ra khi tạo hồ sơ');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Đang tải thông tin...</div>;
    }

    if (!patient) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-red-600">Không tìm thấy bệnh nhân</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tạo hồ sơ bệnh án</h1>
                    <p className="text-gray-500">Ghi nhận chẩn đoán và điều trị mới</p>
                </div>
            </div>

            {/* Patient Info */}
            <PatientInfoCard patient={patient} />

            {/* Form */}
            <RecordForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default CreateRecord;
