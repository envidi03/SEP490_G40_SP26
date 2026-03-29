import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Wrench,
  Eye,
  Loader2,
  RefreshCw,
  Phone,
  UserPlus,
  Package,
  FileText,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Toast from "../../components/ui/Toast";
import ViewAppointmentModal from "./modals/ViewAppointmentModal";
import AssignDoctorModal from "./modals/AssignDoctorModal";
import ReportEquipmentModal from "./modals/ReportEquipmentModal";
import PrepareAppointmentModal from "./modals/PrepareAppointmentModal";
import appointmentService from "../../services/appointmentService";
import staffService from "../../services/staffService";
import equipmentService from "../../services/equipmentService";
import SharedPagination from "../../components/ui/SharedPagination";

const AssistantAppointments = () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrepareModal, setShowPrepareModal] = useState(false);

  // --- debounced searchTerm ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, filterDoctor, filterStatus, debouncedSearch]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments for selected date
      const apptParams = {
        appointment_date: selectedDate,
        page: currentPage,
        limit: 6,
      };
      if (filterDoctor !== "all") {
        apptParams.doctor_id = filterDoctor;
      }
      if (filterStatus !== "all") {
        apptParams.status = filterStatus;
      }
      if (debouncedSearch) {
        apptParams.search = debouncedSearch;
      }

      const apptResponse =
        await appointmentService.getStaffAppointments(apptParams);

      // Lấy danh sách lịch hẹn và cấu trúc phân trang từ response trả về.
      // Do Axios interceptor có thể trả về các cấu trúc khác nhau tùy cài đặt, ta cần kiêm tra:
      let apptData = [];
      let paginationData = null;
      if (apptResponse) {
        if (Array.isArray(apptResponse.data?.data)) {
          // Trường hợp 1: data bị lồng 2 lớp (VD: { data: { data: [...] } })
          apptData = apptResponse.data.data;
        } else if (Array.isArray(apptResponse.data)) {
          // Trường hợp 2: Cấu trúc GetListSuccess chuẩn từ backend (VD: { data: [...], pagination: {...} })
          apptData = apptResponse.data;
        } else if (Array.isArray(apptResponse)) {
          // Trường hợp 3: API trả thẳng về mảng
          apptData = apptResponse;
        }

        // Phân trang có thể nằm trên cùng 1 cấp với data (apptResponse.pagination) 
        // hoặc lồng cấp bên trong (apptResponse.data.pagination)
        paginationData = apptResponse.pagination || apptResponse.data?.pagination;
      }
      setAppointments(apptData);

      if (paginationData) {
        setTotalItems(paginationData.totalItems || 0);
        const size = paginationData.size || 10;
        setTotalPages(Math.ceil((paginationData.totalItems || 0) / size) || 1);
      } else {
        setTotalItems(apptData.length);
        setTotalPages(1);
      }

      // 2. Fetch doctors for the filter
      if (doctors.length === 0) {
        const staffResponse = await staffService.getStaffs({
          role_name: "DOCTOR",
        });
        let docsData = staffResponse.data?.data || staffResponse.data || [];
        setDoctors(docsData);
      }

      // 3. Fetch equipments for reporting
      if (equipments.length === 0) {
        const equipResponse = await equipmentService.getEquipments({
          limit: 100,
        });
        setEquipments(equipResponse.data?.data || equipResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({ show: true, message: "Lỗi khi tải dữ liệu!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterDoctor, filterStatus, debouncedSearch, currentPage]);

  const filteredAppointments = appointments;

  const getStatusInfo = (status) => {
    switch (status) {
      case "COMPLETED":
        return { label: "Hoàn thành", variant: "primary", icon: CheckCircle };
      case "IN_CONSULTATION":
        return { label: "Đang khám", variant: "success", icon: Clock };
      case "CHECKED_IN":
        return { label: "Đã đến", variant: "success", icon: Clock };
      case "SCHEDULED":
        return { label: "Chờ khám", variant: "warning", icon: Clock };
      case "CANCELLED":
        return { label: "Đã hủy", variant: "danger", icon: XCircle };
      default:
        return { label: status, variant: "default", icon: Clock };
    }
  };

  const handleViewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleAssignClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const closeModals = () => {
    setShowAssignModal(false);
    setShowViewModal(false);
    setShowReportModal(false);
    setShowPrepareModal(false);
    setSelectedAppointment(null);
  };

  const handleViewProfile = (appointment) => {
    console.log("app: ", appointment);
  };

  const handleUpdateStatus = async (appointmentId, newStatus, doctorId) => {
    try {
      // Pass doctorId to synchronize with backend signature
      await appointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus,
        doctorId,
      );
      setToast({
        show: true,
        message: "Cập nhật trạng thái thành công!",
        type: "success",
      });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({
        show: true,
        message: "Lỗi khi cập nhật trạng thái!",
        type: "error",
      });
    }
  };

  const handleAssignComplete = async (appointmentId, data) => {
    // Here we update the status to IN_CONSULTATION and assign the doctor
    console.log("Doctor assigned:", appointmentId, data);
    await handleUpdateStatus(appointmentId, "IN_CONSULTATION", data.doctorId);
  };

  const handlePrepareComplete = async (appointmentId, data) => {
    try {
      console.log("Preparation completed:", appointmentId, data);

      // If there are errors reported
      if (data.hasError && data.equipment) {
        // Additional error handling logic here if needed
        console.warn(
          "Some equipments were reported with errors during preparation.",
        );
      }

      // Update status to IN_CONSULTATION and assign doctor based on preparation data
      await handleUpdateStatus(appointmentId, "IN_CONSULTATION", data.doctorId);
      setToast({
        show: true,
        message: "Chuẩn bị ca khám thành công!",
        type: "success",
      });
    } catch (error) {
      console.error("Error in preparation:", error);
      setToast({
        show: true,
        message: "Lỗi khi xử lý chuẩn bị!",
        type: "error",
      });
    }
  };

  const handleReportSubmit = async (appointmentId, data) => {
    try {
      console.log("Reporting incident:", appointmentId, data);
      const { equipmentId, ...rest } = data;
      await equipmentService.reportIncident(equipmentId, {
        ...rest,
        appointment_id: appointmentId,
      });
      setToast({
        show: true,
        message: "Gửi báo cáo sự cố thành công!",
        type: "success",
      });
      fetchData(); // Refresh to see updated equipment status if displayed
    } catch (error) {
      console.error("Error reporting incident:", error);
      setToast({
        show: true,
        message: "Lỗi khi gửi báo cáo sự cố!",
        type: "error",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Lịch Khám
          </h1>
          <p className="text-gray-600 mt-1">Chuẩn bị và theo dõi lịch hẹn</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          title="Tải lại"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bác sĩ
            </label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.profile?.full_name || doctor.name || "Không xác định"}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SCHEDULED">Chờ khám</option>
              <option value="CHECKED_IN">Đã đến</option>
              <option value="IN_CONSULTATION">Đang khám</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tên, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card>
            <div className="text-center py-16">
              <Loader2
                size={40}
                className="mx-auto text-primary-500 animate-spin mb-4"
              />
              <p className="text-gray-500">Đang tải lịch hẹn...</p>
            </div>
          </Card>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const statusInfo = getStatusInfo(apt.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={apt._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Time */}
                    <div className="bg-primary-100 p-4 rounded-lg text-center min-w-[80px]">
                      <div className="text-xs text-primary-600 font-medium">
                        Giờ
                      </div>
                      <div className="text-lg font-bold text-primary-700">
                        {apt.appointment_time}
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {apt.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Phone size={14} />
                        {apt.phone}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Dịch vụ: </span>
                        {apt.book_service && apt.book_service.length > 0
                          ? apt.book_service
                            .map((s) => s.service_name || "Khám chung")
                            .join(", ")
                          : apt.reason || "Khám chung"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Bác sĩ:</span>{" "}
                        {apt.doctor_info?.profile?.full_name || "Chưa chỉ định"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon size={14} className="inline mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center gap-3 ml-4">
                    {/* Nút Xem chi tiết: Thêm text để rõ ràng hơn */}
                    <button
                      onClick={() => handleViewClick(apt)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200 group shadow-sm"
                      title="Xem chi tiết lịch hẹn"
                    >
                      <Eye
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="text-sm font-medium">Chi tiết</span>
                    </button>

                    {/* Nút Gán bác sĩ: Chỉ hiển thị khi đã CHECKED_IN */}
                    {apt.status === "CHECKED_IN" && (
                      <button
                        onClick={() => handleAssignClick(apt)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md active:transform active:scale-95"
                      >
                        <UserPlus size={18} />
                        <span className="text-sm font-bold tracking-tight">
                          Bắt đầu khám
                        </span>
                      </button>
                    )}

                    {/* Nút Xem hồ sơ: Nút hành động chính, nổi bật và rõ ràng */}
                    {apt.status === "IN_CONSULTATION" && (
                      <button
                        onClick={() => handleViewProfile(apt)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm active:transform active:scale-95"
                      >
                        <FileText size={18} />
                        <span className="text-sm font-bold tracking-tight">
                          Xem hồ sơ bệnh nhân
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Không có lịch hẹn nào</p>
            </div>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredAppointments.length > 0 && !loading && (
        <SharedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          itemLabel="lịch hẹn"
        />
      )}

      {/* Modals */}
      <ViewAppointmentModal
        appointment={selectedAppointment}
        isOpen={showViewModal}
        onClose={closeModals}
      />
      <AssignDoctorModal
        appointment={selectedAppointment}
        isOpen={showAssignModal}
        onClose={closeModals}
        onComplete={handleAssignComplete}
        doctors={doctors}
      />
      <PrepareAppointmentModal
        appointment={selectedAppointment}
        isOpen={showPrepareModal}
        onClose={closeModals}
        onComplete={handlePrepareComplete}
        doctors={doctors}
      />
      <ReportEquipmentModal
        appointment={selectedAppointment}
        isOpen={showReportModal}
        onClose={closeModals}
        onSubmit={handleReportSubmit}
        equipments={equipments}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default AssistantAppointments;
