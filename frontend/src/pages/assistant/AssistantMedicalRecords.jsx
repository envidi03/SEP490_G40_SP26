import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  RotateCcw,
  Filter as FilterIcon
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
  // --- 1. STATE QUẢN LÝ BỘ LỌC (Tạm thời trên UI) ---
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");

  // --- 2. STATE THỰC TẾ ĐỂ GỌI API (Chỉ thay đổi khi bấm nút Tìm kiếm) ---
  const [filterParams, setFilterParams] = useState({
    search: "",
    status: "all",
  });

  // --- 3. STATE DỮ LIỆU & PHÂN TRANG ---
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- 4. STATE MODALS ---
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // --- API FETCHING ---
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5,
        search: filterParams.search.trim() || undefined,
        filter_dental_record: filterParams.status !== "all" ? filterParams.status : undefined,
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
  }, [currentPage, filterParams]);

  // Chạy API khi tham số lọc thực tế hoặc trang thay đổi
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- HANDLERS CHO BỘ LỌC ---
  
  // Hành động khi bấm nút TÌM KIẾM
  const handleApplyFilters = () => {
    setCurrentPage(1); // Luôn về trang 1 khi lọc mới
    setFilterParams({
      search: tempSearch,
      status: tempStatus,
    });
  };

  // Hành động khi bấm nút LÀM MỚI (Clean)
  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("all");
    setFilterDoctor("all");
    setCurrentPage(1);
    setFilterParams({
      search: "",
      status: "all",
    });
  };

  // Nhấn Enter để tìm kiếm nhanh
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  // --- CÁC LOGIC HỖ TRỢ KHÁC ---
  const getStatusInfo = (status) => {
    const statusMap = {
      COMPLETED: { label: "Hoàn thành", variant: "success", icon: CheckCircle },
      IN_PROGRESS: { label: "Đang điều trị", variant: "warning", icon: Clock },
      CANCELLED: { label: "Đã hủy", variant: "danger", icon: FileText },
    };
    return statusMap[status] || { label: status, variant: "default", icon: FileText };
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

  // Lọc local cho Bác sĩ (vì data bác sĩ thường nằm trong info lồng nhau)
  const filteredRecords = records.filter((record) => {
    return (
      filterDoctor === "all" ||
      record.doctor_info?.profile?.full_name === filterDoctor
    );
  });

  const doctorsList = ["all", ...new Set(records.map((r) => r.doctor_info?.profile?.full_name).filter(Boolean))];

  return (
    <div className="p-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hồ Sơ Bệnh Án</h1>
        <p className="text-gray-500 mt-1 italic">Quản lý và cập nhật hồ sơ nha khoa chuyên nghiệp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng hồ sơ (Trang này)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
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

      {/* Manual Filter Section */}
      <Card className="mb-8 shadow-sm border-gray-100">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tên hồ sơ, tên bác sĩ"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái</label>
              <select
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="IN_PROGRESS">Đang điều trị</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            {/* Doctor Filter (Local) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bác sĩ phụ trách</label>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer text-blue-600 font-medium"
              >
                {doctorsList.map((doc) => (
                  <option key={doc} value={doc}>{doc === "all" ? "Tất cả bác sĩ" : doc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleApplyFilters}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <Search size={18} />
              <span>Tìm kiếm</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all active:scale-90"
              title="Xóa bộ lọc"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 font-medium italic">Đang tải danh sách hồ sơ...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const { label, variant, icon: StatusIcon } = getStatusInfo(record.status);

            return (
              <Card key={record._id} className="hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-800">{record.record_name}</h3>
                        <Badge variant={variant} className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                          <StatusIcon size={12} className="inline mr-1" />
                          {label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                        <p><span className="text-gray-400 font-normal">Bệnh nhân:</span> <span className="font-semibold text-gray-600">{record.full_name }</span></p>
                        <p><span className="text-gray-400 font-normal">SĐT:</span> <span className="font-semibold text-gray-600">{record.phone || record.patientPhone}</span></p>
                        <p><span className="text-gray-400 font-normal">Bác sĩ:</span> <span className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4">{record.doctor_info?.profile?.full_name || "Chưa phân công"}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <button
                      onClick={() => handleViewClick(record)}
                      className="flex-1 md:flex-none p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Xem chi tiết"
                    >
                      <Eye size={20} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateClick(record)}
                      className="flex-1 md:flex-none p-2.5 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Cập nhật"
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
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Không có dữ liệu</h3>
            <p className="text-gray-400 text-sm mt-2">Vui lòng thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemLabel="hồ sơ"
          />
        </div>
      )}

      {/* Modals */}
      <ViewRecordModal record={selectedRecord} isOpen={showViewModal} onClose={closeModals} />
      <UpdateRecordModal record={selectedRecord} isOpen={showUpdateModal} onClose={closeModals} onSave={handleSaveRecord} />
    </div>
  );
};

export default AssistantMedicalRecords;