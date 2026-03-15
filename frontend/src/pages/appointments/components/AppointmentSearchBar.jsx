import React from "react"

const AppointmentSearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-gray-400 text-lg">⚲</span>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm bệnh nhân, số điện thoại, mã lịch hẹn..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[13px] text-gray-800 placeholder-gray-400 font-medium transition-colors"
      />
    </div>
  )
}

export default AppointmentSearchBar
