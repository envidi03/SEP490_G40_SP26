import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDentalRecordById } from '../../services/dentalRecordService';
import RecordDetailHeader from './components/RecordDetailHeader';
import RecordPatientCard from './components/RecordPatientCard';
import RecordInfoCard from './components/RecordInfoCard';
import TreatmentTable from './components/TreatmentTable';

const DentalRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            setIsLoading(true);
            setIsVisible(false);
            setError(null);
            try {
                // GET /api/dentist/dental-record/:id
                const res = await getDentalRecordById(id);
                setRecord(res.data);
            } catch (err) {
                console.error('Error fetching dental record:', err);
                setError(err.response?.data?.message || 'Không thể tải hồ sơ. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
                setTimeout(() => setIsVisible(true), 60);
            }
        };
        fetchDetail();
    }, [id]);

    // ── Loading skeleton ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-lg w-48" />
                <div className="h-8 bg-gray-100 rounded-xl w-80" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl h-48" />
                    <div className="bg-gray-50 rounded-2xl h-48" />
                </div>
                <div className="bg-gray-50 rounded-2xl h-64" />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-lg mx-auto mt-16 bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────
    if (!record) {
        return (
            <div className="mt-24 text-center text-gray-400 text-sm">
                <p>Không tìm thấy hồ sơ nha khoa</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-3 text-teal-500 hover:underline text-sm"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const treatments = record.treatments || [];
    const pendingCount = treatments.filter(t => t.status === 'WAITING_APPROVAL').length;

    // ── Render ────────────────────────────────────────────────────
    return (
        <div
            className="space-y-5 transition-all duration-200"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(6px)' }}
        >
            {/* Header: breadcrumb + title + back button */}
            <RecordDetailHeader
                record={record}
                pendingCount={pendingCount}
                onBack={() => navigate(-1)}
            />

            {/* Info cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecordPatientCard record={record} />
                <RecordInfoCard record={record} />
            </div>

            {/* Treatment list */}
            <TreatmentTable treatments={treatments} />
        </div>
    );
};

export default DentalRecordDetail;
