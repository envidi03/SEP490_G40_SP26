"use client"

import { Search, Filter } from "lucide-react"
import Card from "../../../components/ui/Card"

const PatientSearchBar = ({ searchTerm, onSearchChange, filterStatus, onFilterChange }) => {
  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân (tên, số điện thoại, mã BN)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 md:w-48">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>
    </Card>
  )
}

export default PatientSearchBar
