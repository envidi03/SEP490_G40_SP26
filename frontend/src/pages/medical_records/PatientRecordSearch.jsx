import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { findPatientByInfo, getDentalRecordsByPatient } from '../../services/dentalRecordService';
import PatientSearchBar from './components/PatientSearchBar';
import PatientCard from './components/PatientCard';
import PatientRecordList from './components/PatientRecordList';
import CreateDentalRecordModal from './components/CreateDentalRecordModal';

const PatientRecordSearch = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ── Patient search state ──────────────────────────────────────
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // ── Dental records state ──────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // ── Create modal state ────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Initial query params loading
    useEffect(() => {
        const phone = searchParams.get('phone');
        const name = searchParams.get('name');

        // Ưu tiên số điện thoại tìm cho chính xác hơn, nếu ko có thì dùng tên
        let initialSearch = '';
        if (phone) initialSearch = phone;
        else if (name) initialSearch = name;

        if (initialSearch) {
            setInputValue(initialSearch);
            // Cập nhật searchTerm ngay để hook gọi API được kích hoạt sớm nhất
            setSearchTerm(initialSearch);
        }
    }, [searchParams]);

    // Chỉ cho tạo hồ sơ mới khi không còn hồ sơ IN_PROGRESS nào
    const canCreate = !records.some(r => r.status === 'IN_PROGRESS');

    // ── Debounce search 400ms ─────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(inputValue.trim()), 400);
        return () => clearTimeout(t);
    }, [inputValue]);

    // ── Search patients ───────────────────────────────────────────
    useEffect(() => {
        if (!searchTerm) {
            setPatients([]);
            setSelectedPatient(null);
            setRecords([]);
            return;
        }
        const doSearch = async () => {
            setIsSearching(true);
            try {
                const res = await findPatientByInfo(searchTerm);
                const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
                setPatients(list);

                // Cải tiến: Nếu truyền phone từ màn Lịch hẹn sang sang và trả ra ĐÚNG 1 bệnh nhân, tự động chọn bệnh nhân đó để bác sĩ không phải mất công bấm
                if (list.length === 1 && !selectedPatient) {
                    setSelectedPatient(list[0]);
                    fetchRecords(list[0]);
                } else {
                    setSelectedPatient(prev =>
                        prev && list.find(p => p.patient_id === prev.patient_id) ? prev : null
                    );
                }
            } catch (err) {
                console.error('Patient search error:', err);
                setPatients([]);
            } finally {
                setIsSearching(false);
            }
        };
        doSearch();
    }, [searchTerm]);

    // ── Fetch dental records by patient ───────────────────────────
    const fetchRecords = useCallback(async (patient) => {
        if (!patient?.patient_id) return;
        setIsLoadingRecords(true);
        setIsVisible(false);
        setRecordsError(null);
        try {
            const res = await getDentalRecordsByPatient(patient.patient_id);
            setRecords(res.data ?? []);
        } catch (err) {
            console.error('Error loading patient records:', err);
            setRecordsError('Không thể tải hồ sơ của bệnh nhân. Vui lòng thử lại.');
        } finally {
            setIsLoadingRecords(false);
            setTimeout(() => setIsVisible(true), 60);
        }
    }, []);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        fetchRecords(patient);
    };

    const handleClear = () => {
        setInputValue('');
        setSearchTerm('');
        setPatients([]);
        setSelectedPatient(null);
        setRecords([]);
        // Clear params in URL if needed
        navigate('/dentist/dental-records/search', { replace: true });
    };

    // Sau khi tạo hồ sơ thành công: reload danh sách và navigate đến chi tiết
    const handleCreateSuccess = (newRecord) => {
        setIsCreateModalOpen(false);
        if (newRecord?._id) {
            navigate(`/dentist/dental-records/${newRecord._id}`);
        } else {
            fetchRecords(selectedPatient);
        }
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="pb-3 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tìm kiếm hồ sơ nha khoa</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Tìm bệnh nhân, sau đó xem hoặc tạo hồ sơ nha khoa
                </p>
            </div>

            {/* Search bar */}
            <PatientSearchBar
                value={inputValue}
                onChange={setInputValue}
                isSearching={isSearching}
            />

            {/* Main 2-col layout */}
            {(patients.length > 0 || selectedPatient) && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    {/* Left: Patient results */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-500">
                                Tìm thấy <span className="font-medium text-gray-700">{patients.length}</span> bệnh nhân
                            </p>
                            <button
                                onClick={handleClear}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors hover:underline underline-offset-2"
                            >
                                Xóa tìm kiếm
                            </button>
                        </div>

                        {patients.length === 0 && searchTerm && !isSearching && (
                            <div className="bg-white border border-gray-100 rounded-2xl py-10 text-center text-gray-400 text-sm">
                                Không tìm thấy bệnh nhân khớp với "{searchTerm}"
                            </div>
                        )}

                        <div className="space-y-2">
                            {patients.map(p => (
                                <PatientCard
                                    key={p.patient_id}
                                    patient={p}
                                    isSelected={selectedPatient?.patient_id === p.patient_id}
                                    onSelect={handleSelectPatient}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Dental records */}
                    <div
                        className="md:col-span-3 transition-all duration-200"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(6px)'
                        }}
                    >
                        {selectedPatient ? (
                            <PatientRecordList
                                patient={selectedPatient}
                                records={records}
                                isLoading={isLoadingRecords}
                                error={recordsError}
                                onRetry={() => fetchRecords(selectedPatient)}
                                canCreate={!isLoadingRecords && canCreate}
                                onCreateClick={() => setIsCreateModalOpen(true)}
                            />
                        ) : (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400 text-sm">
                                Chọn một bệnh nhân để xem hồ sơ nha khoa
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!searchTerm && patients.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
                    <p className="text-gray-400 text-sm">Nhập thông tin bệnh nhân để bắt đầu tìm kiếm</p>
                </div>
            )}

            {/* Create modal */}
            <CreateDentalRecordModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                patientId={selectedPatient?.patient_id}
                patientName={selectedPatient?.full_name}
                patientPhone={selectedPatient?.phone}
                patientEmail={selectedPatient?.email}
                patientGender={selectedPatient?.gender}
                patientDateOfBirth={selectedPatient?.date_of_birth}
            />
        </div>
    );
};

export default PatientRecordSearch;
