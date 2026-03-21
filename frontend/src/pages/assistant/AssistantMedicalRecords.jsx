import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SharedPagination from "../../components/ui/SharedPagination";
import { getAllDentalRecords } from "../../services/dentalRecordService";
import TreatmentComponent from "./components/TreatmentComponent";

const AssistantMedicalRecords = () => {
  // --- 1. STATE BỘ LỌC TẠM THỜI (Giao diện UI) ---
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");

  // --- 2. STATE THAM SỐ THỰC TẾ (Dùng để gọi API) ---
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

  const [expandedId, setExpandedId] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5,
        search: filterParams.search.trim() || undefined,
        filter_dental_record:
          filterParams.status !== "all" ? filterParams.status : undefined,
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

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- BỘ LỌC HANDLERS ---
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setFilterParams({
      search: tempSearch,
      status: tempStatus,
    });
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("all");
    setFilterDoctor("all");
    setCurrentPage(1);
    setFilterParams({ search: "", status: "all" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleApplyFilters();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- HELPERS ---
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
    <div className="p-1 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Hồ Sơ Bệnh Án
        </h1>
        <p className="text-gray-500 mt-1 italic">
          Quản lý lộ trình điều trị và hồ sơ bệnh nhân
        </p>
      </div>

      {/* Filter Section */}
      <Card className="mb-8 shadow-md border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tên hồ sơ, bác sĩ..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Trạng thái
              </label>
              <select
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="IN_PROGRESS">Đang điều trị</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Bác sĩ phụ trách
              </label>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-semibold"
              >
                {doctorsList.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc === "all" ? "Tất cả bác sĩ" : doc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleApplyFilters}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              <Search size={18} />
              <span>Tìm kiếm</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all active:scale-90 shadow-sm"
              title="Xóa bộ lọc"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </Card>

      {/* Records Accordion List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 font-medium">
              Đang tải danh sách hồ sơ...
            </p>
          </div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const isExpanded = expandedId === record._id;
            const {
              label,
              variant,
              icon: StatusIcon,
            } = getStatusInfo(record.status);

            return (
              <div
                key={record._id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-blue-200 shadow-md ring-1 ring-blue-50" : "border-gray-100 shadow-sm"}`}
              >
                {/* Accordion Header */}
                <div
                  className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                  onClick={() => toggleExpand(record._id)}
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div
                      className={`p-3 rounded-xl transition-colors ${isExpanded ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      <FileText size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {record.record_name}
                        </h3>
                        <Badge
                          variant={variant}
                          className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase"
                        >
                          <StatusIcon size={12} className="inline mr-1" />
                          {label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <User size={14} className="text-gray-400" />{" "}
                          {record.full_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />{" "}
                          {record.phone}
                        </span>
                        <span className="text-blue-600 font-bold">
                          BS: {record.doctor_info?.profile?.full_name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-full transition-colors ${isExpanded ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Accordion Content (Details & Treatments) */}
                {isExpanded && (
                  <div className="p-6 bg-white border-t border-gray-50 space-y-8 animate-in slide-in-from-top-2 duration-300">
                    {/* Diagnosis & Tooth Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Stethoscope size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Chẩn đoán từ bác sĩ
                          </span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 font-semibold border border-gray-100">
                          {record.diagnosis || "Chưa có chẩn đoán chi tiết"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Activity size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Tình trạng răng miệng
                          </span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 font-semibold border border-gray-100">
                          {record.tooth_status ||
                            "Chưa ghi nhận tình trạng cụ thể"}
                        </div>
                      </div>
                    </div>

                    {/* Treatment Timeline */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 italic">
                          <Calendar size={16} className="text-blue-500" />
                          Lộ trình điều trị chi tiết (
                          {record.treatments?.length || 0})
                        </h4>
                      </div>

                      {record.treatments && record.treatments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {record.treatments.map((treat, idx) => (
                            <TreatmentComponent key={treat._id} treatment={treat} index={idx}/>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-gray-400 text-xs font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          Chưa có dữ liệu điều trị trong hồ sơ này.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400 uppercase">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      {!loading && totalItems > 0 && (
        <div className="mt-8 flex justify-center">
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemLabel="hồ sơ"
          />
        </div>
      )}
    </div>
  );
};

export default AssistantMedicalRecords;
