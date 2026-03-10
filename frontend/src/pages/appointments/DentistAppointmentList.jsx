import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import appointmentService from "../../services/appointmentService"
import { getDentalRecordsByPatient } from "../../services/dentalRecordService"

import AppointmentDetailModal from "./components/AppointmentDetailModal"
import PatientInfoModal from "./components/PatientInfoModal"
import CreateDentalRecordModal from "../medical_records/components/CreateDentalRecordModal"
import AppointmentFilters from "./components/AppointmentFilters"
import AppointmentTable from "./components/AppointmentTable"
import AppointmentPagination from "./components/AppointmentPagination"

const DentistAppointmentList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Backend Filters, Sort & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [sortOrder, setSortOrder] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 5

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPatientInfoModalOpen, setIsPatientInfoModalOpen] = useState(false)
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState(false)
  const [appointmentForRecord, setAppointmentForRecord] = useState(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        status: "IN_CONSULTATION",
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (sortOrder) {
        params.sort = sortOrder;
      }

      const res = await appointmentService.getDoctorAppointments(params);

      if (res?.data) {
        const responseData = res.data;
        setAppointments(responseData);

        if (responseData.pagination) {
          setTotalItems(responseData.pagination.totalItems || 0);
        } else {
          setTotalItems(responseData.length); // fallback
        }
      }
    } catch (err) {
      console.error('Fetch Doctor Appointments Error:', err);
      setError('Không thể lấy danh sách lịch hẹn. Vui lòng thử lại sau.');
      setAppointments([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortOrder]);

  // Fetch call
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, page, debouncedSearch, sortOrder])

  // Actions
  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  const handleCreateRecord = async (appointment) => {
    setAppointmentForRecord(appointment)

    if (appointment.status === 'IN_CONSULTATION') {
      try {
        const patientObj = appointment.patient_id || {};
        const patientId = patientObj._id || patientObj.id || patientObj;

        if (patientId && typeof patientId === 'string') {
          const res = await getDentalRecordsByPatient(patientId);
          const records = res.data || [];
          if (records.length === 0) {
            // No existing records -> open Create Modal directly
            setIsCreateRecordModalOpen(true);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check patient records:", err);
      }
    }

    // Default flow if condition not met, or fallback
    setIsPatientInfoModalOpen(true)
  }

  const handlePatientInfoConfirm = (patientInfo) => {
    setIsPatientInfoModalOpen(false)
    const params = new URLSearchParams({
      name: patientInfo.name,
      dob: patientInfo.dob,
      gender: patientInfo.gender,
      phone: patientInfo.phone,
    })
    navigate(`/dentist/dental-records/search?${params.toString()}`)
  }

  const handleCreateRecordSuccess = (newRecord) => {
    setIsCreateRecordModalOpen(false);
    if (newRecord?._id) {
      navigate(`/dentist/dental-records/${newRecord._id}`);
    } else {
      // Fallback
      handlePatientInfoConfirm({
        name: appointmentForRecord?.patient_id?.full_name || '',
        dob: appointmentForRecord?.patient_id?.dob ? new Date(appointmentForRecord.patient_id.dob).toISOString().split('T')[0] : '',
        gender: appointmentForRecord?.patient_id?.gender ? "MALE" : "FEMALE",
        phone: appointmentForRecord?.patient_id?.phone || '',
      });
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortOrder("");
    setPage(1);
  }

  // Helpers for exact bindings
  const patientData = appointmentForRecord?.patient_id || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Lịch Hẹn Của Tôi</h1>
        <p className="text-xs text-gray-400 mt-1">Lịch khám và dịch vụ trong ngày được chỉ định cho bạn</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onClearFilters={handleClearFilters}
      />

      {/* Table wrapper */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Tổng quan lịch khám</h2>
          <span className="text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-lg text-xs font-bold">
            {totalItems > 0
              ? `Hiển thị ${(page - 1) * limit + 1} - ${Math.min(page * limit, totalItems)} / Tổng ${totalItems}`
              : 'Không có kết quả'}
          </span>
        </div>

        <AppointmentTable
          appointments={appointments}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
          onCreateRecord={handleCreateRecord}
        />

        {!isLoading && totalItems > limit && (
          <AppointmentPagination
            page={page}
            setPage={setPage}
            limit={limit}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Modals */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
      />

      <PatientInfoModal
        isOpen={isPatientInfoModalOpen}
        onClose={() => setIsPatientInfoModalOpen(false)}
        appointment={appointmentForRecord}
        onConfirm={handlePatientInfoConfirm}
      />

      <CreateDentalRecordModal
        isOpen={isCreateRecordModalOpen}
        onClose={() => setIsCreateRecordModalOpen(false)}
        onSuccess={handleCreateRecordSuccess}
        patientId={patientData._id || patientData.id}
        patientName={patientData.full_name || appointmentForRecord?.full_name || ''}
        patientPhone={patientData.phone || appointmentForRecord?.phone || ''}
        patientEmail={patientData.email || appointmentForRecord?.email || ''}
        patientGender={patientData.gender === true ? 'MALE' : patientData.gender === false ? 'FEMALE' : ''}
        patientDateOfBirth={patientData.dob || ''}
      />
    </div>
  )
}

export default DentistAppointmentList
