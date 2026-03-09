import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { getDoctorAppointments } from "../../services/appointmentService"

import AppointmentDetailModal from "./components/AppointmentDetailModal"
import PatientInfoModal from "./components/PatientInfoModal"
import AppointmentSearchBar from "./components/AppointmentSearchBar"

// Define Status Styles
const getStatusBadge = (status) => {
  const colorMap = {
    Confirmed: "bg-teal-50 text-teal-700 border border-teal-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border border-blue-200",
    Cancelled: "bg-red-50 text-red-600 border border-red-200",
  }
  const color = colorMap[status] || "bg-gray-50 text-gray-600 border border-gray-200";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${color}`}>{status}</span>;
}

const DentistAppointmentList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Backend Filters, Sort & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [statusFilter, setStatusFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 5

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPatientInfoModalOpen, setIsPatientInfoModalOpen] = useState(false)
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
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }

      if (sortOrder) {
        params.sort = sortOrder;
      }

      const res = await getDoctorAppointments(params);

      if (res?.data) {
        // If API returns { data, pagination } format:
        const responseData = res.data;
        setAppointments(responseData);

        console.log(responseData)

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
  }, [debouncedSearch, statusFilter, sortOrder]);

  // Fetch call
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, page, debouncedSearch, statusFilter, sortOrder])

  // Actions
  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  const handleCreateRecord = (appointment) => {
    setAppointmentForRecord(appointment)
    setIsPatientInfoModalOpen(true)
  }

  const handlePatientInfoConfirm = (patientInfo) => {
    setIsPatientInfoModalOpen(false)
    const params = new URLSearchParams({
      name: patientInfo.name,
      dob: patientInfo.dob,
      gender: patientInfo.gender,
      phone: patientInfo.phone,
      appointmentId: appointmentForRecord?.appointment_id || appointmentForRecord?.id || '',
    })
    navigate(`/dentist/dental-records?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortOrder("");
    setPage(1);
  }

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
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm space-y-4">
        <AppointmentSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white outline-none cursor-pointer"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Pending">Chờ xác nhận</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Sắp xếp ngày hẹn</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white outline-none cursor-pointer"
            >
              <option value="">Không sắp xếp</option>
              <option value="asc">Cũ nhất đến Mới nhất</option>
              <option value="desc">Mới nhất đến Cũ nhất</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

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

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="space-y-3 p-5 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-50 rounded-xl" />
              <div className="h-16 bg-gray-50 rounded-xl" />
            </div>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white text-gray-400 font-medium text-[12px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 w-1 hidden lg:table-cell">Mã LH</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Bệnh nhân / SĐT</th>
                  <th className="px-5 py-4 hidden sm:table-cell">Dịch vụ</th>
                  <th className="px-5 py-4 w-1 whitespace-nowrap">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-400 text-sm italic">
                      Không có lịch hẹn nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  appointments.map((row) => {
                    const code = row.appointment_id || row.code || "---"
                    const dateStr = row.appointment_date
                      ? new Date(row.appointment_date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })
                      : row.date
                    const timeStr = row.appointment_time || row.start_time || row.time || "Theo giờ hẹn"
                    const pName = row.patient_id?.full_name || row.patientName || row.full_name || "Khách vãng lai"
                    const pPhone = row.patient_id?.phone || row.patientPhone || row.phone || "Chưa cập nhật"

                    // Attempt to read service from book_service array
                    let service = row.appointment_type || row.reason || row.notes || "Khám định kỳ"
                    if (row.book_service && row.book_service.length > 0 && row.book_service[0].service_id?.name) {
                      service = row.book_service.map(s => s.service_id.name).join(', ')
                    } else if (row.book_service && row.book_service.length > 0) {
                      service = "Đã chọn dịch vụ"
                    }

                    const isActionable = row.status === 'Confirmed' || row.status === 'Completed' || row.status === 'CHECKED_IN'

                    return (
                      <tr
                        key={row._id || row.id || code}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        onClick={() => handleViewDetail(row)}
                      >
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500 font-mono text-[11px] hidden lg:table-cell">
                          #{code.toString().slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{timeStr}</span>
                            <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{pName}</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">{pPhone}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 hidden sm:table-cell truncate max-w-[150px]" title={service}>
                          {service}
                        </td>
                        <td className="px-5 py-4 w-1">
                          {getStatusBadge(row.status)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isActionable && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCreateRecord(row) }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-500 hover:text-white rounded-lg font-medium text-[12px] transition-all opacity-0 group-hover:opacity-100 border border-teal-200 hover:border-transparent transform translate-x-2 group-hover:translate-x-0"
                            >
                              ➔ Hồ Sơ
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalItems > limit && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[12px] text-gray-500 font-medium">
              Đang xem trang <span className="text-gray-900 font-bold">{page}</span> / {Math.ceil(totalItems / limit)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm disabled:shadow-none"
              >
                Trang trước
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalItems}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm disabled:shadow-none"
              >
                Trang sau
              </button>
            </div>
          </div>
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
    </div>
  )
}

export default DentistAppointmentList
