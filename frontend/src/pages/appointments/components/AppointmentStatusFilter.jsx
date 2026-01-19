"use client"

const AppointmentStatusFilter = ({ statusFilter, onStatusChange }) => {
  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled"]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === "All" ? "Tất cả trạng thái" : status}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AppointmentStatusFilter
