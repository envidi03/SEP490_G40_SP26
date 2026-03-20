import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SharedPagination from "../../components/ui/SharedPagination";
import ViewRecordModal from "./modals/ViewRecordModal";
import UpdateRecordModal from "./modals/UpdateRecordModal";
import {
  getAllDentalRecords,
  updateDentalRecord,
} from "../../services/dentalRecordService";

const AssistantMedicalRecords = () => {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // --- API FETCHING ---
  // Sử dụng useCallback để hàm không bị khởi tạo lại vô ích
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5,
        search: searchTerm.trim() || undefined,
        filter_dental_record: filterStatus !== "all" ? filterStatus : undefined,
      };

      const response = await getAllDentalRecords(params);
      if (response && response.data) {
        setRecords(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm]);

  // ĐÂY LÀ CHỖ QUAN TRỌNG: Chỉ dùng 1 useEffect để kiểm soát luồng gọi API
  useEffect(() => {
    const delay = searchTerm ? 500 : 0;
    const timer = setTimeout(() => {
      fetchRecords();
    }, delay);

    return () => clearTimeout(timer);
  }, [fetchRecords]);

  // Reset về trang 1 mỗi khi từ khóa tìm kiếm hoặc bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // --- HANDLERS ---
  const getStatusInfo = (status) => {
    const statusMap = {
      COMPLETED: { label: "Hoàn thành", variant: "success", icon: CheckCircle },
      IN_PROGRESS: { label: "Đang điều trị", variant: "warning", icon: Clock },
      CANCELLED: { label: "Đã hủy", variant: "danger", icon: FileText },
    };
    return (
      statusMap[status] || { label: status, variant: "default", icon: FileText }
    );
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleUpdateClick = (record) => {
    setSelectedRecord(record);
    setShowUpdateModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowUpdateModal(false);
    setSelectedRecord(null);
  };

  const handleSaveRecord = async (recordId, data) => {
    try {
      await updateDentalRecord(recordId, data);
      fetchRecords();
      closeModals();
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  // Lọc local cho bác sĩ (vì thường bác sĩ không lọc sâu dưới backend)
  const filteredRecords = records.filter((record) => {
    return (
      filterDoctor === "all" ||
      record.doctor_info?.profile?.full_name === filterDoctor
    );
  });

  const doctorsList = [
    "all",
    ...new Set(
      records.map((r) => r.doctor_info?.profile?.full_name).filter(Boolean),
    ),
  ];

  return (
    <div className="p-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Hồ Sơ Bệnh Án
        </h1>
        <p className="text-gray-500 mt-1 italic">
          Quản lý và cập nhật hồ sơ nha khoa chuyên nghiệp
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng hồ sơ</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalItems}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Đang điều trị</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {records.filter((r) => r.status === "IN_PROGRESS").length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Clock size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {records.filter((r) => r.status === "COMPLETED").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="mb-8 shadow-sm border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tên bệnh nhân, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Trạng thái hồ sơ
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="IN_PROGRESS">Đang điều trị</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Bác sĩ phụ trách
            </label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              {doctorsList.map((doc) => (
                <option key={doc} value={doc}>
                  {doc === "all" ? "Tất cả bác sĩ" : doc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 font-medium">
              Đang đồng bộ dữ liệu hồ sơ...
            </p>
          </div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const {
              label,
              variant,
              icon: StatusIcon,
            } = getStatusInfo(record.status);
            const formattedDate = new Date(
              record.start_date || record.createdAt,
            ).toLocaleDateString("vi-VN");

            return (
              <Card
                key={record._id}
                className="hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    {/* Date UI */}
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl text-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        Ngày khám
                      </div>
                      <div className="text-sm font-extrabold text-gray-700">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-800">
                          {record.full_name || record.patientName}
                        </h3>
                        <Badge
                          variant={variant}
                          className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase"
                        >
                          <StatusIcon size={12} className="inline mr-1" />
                          {label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                        <p>
                          <span className="text-gray-400">Bệnh án:</span>{" "}
                          <span className="font-medium text-gray-600">
                            {record.record_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">SĐT:</span>{" "}
                          <span className="font-medium text-gray-600">
                            {record.phone || record.patientPhone}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">Bác sĩ:</span>{" "}
                          <span className="font-medium text-blue-600">
                            {record.doctor_info?.profile?.full_name ||
                              "Chưa phân công"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <button
                      onClick={() => handleViewClick(record)}
                      className="flex-1 md:flex-none p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Xem hồ sơ chi tiết"
                    >
                      <Eye size={20} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateClick(record)}
                      className="flex-1 md:flex-none p-2.5 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Cập nhật tiến trình"
                    >
                      <Edit size={20} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <FileText size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Trống trơn!</h3>
            <p className="text-gray-400 text-sm">
              Không tìm thấy hồ sơ nào khớp với bộ lọc hiện tại.
            </p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {!loading && totalItems > 0 && (
        <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemLabel="hồ sơ"
          />
        </div>
      )}

      {/* Modals Container */}
      <ViewRecordModal
        record={selectedRecord}
        isOpen={showViewModal}
        onClose={closeModals}
      />
      <UpdateRecordModal
        record={selectedRecord}
        isOpen={showUpdateModal}
        onClose={closeModals}
        onSave={handleSaveRecord}
      />
    </div>
  );
};

export default AssistantMedicalRecords;
