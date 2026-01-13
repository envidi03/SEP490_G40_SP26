"use client"

import { Eye } from "lucide-react"
import Card from "../../../components/ui/Card"
import Badge from "../../../components/ui/Badge"
import Table from "../../../components/ui/Table"

const PatientTableSection = ({ patients, onViewPatient }) => {
  const columns = [
    {
      header: "Mã BN",
      accessor: "code",
      render: (row) => <span className="font-medium text-blue-600">{row.code}</span>,
    },
    {
      header: "Tên bệnh nhân",
      accessor: "name",
    },
    {
      header: "Ngày sinh",
      accessor: "dob",
      render: (row) => {
        const age = new Date().getFullYear() - new Date(row.dob).getFullYear()
        return `${row.dob} (${age} tuổi)`
      },
    },
    {
      header: "Giới tính",
      accessor: "gender",
    },
    {
      header: "Số điện thoại",
      accessor: "phone",
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "success" : "default"}>
          {row.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      header: "Thao tác",
      render: (row) => (
        <button
          onClick={() => onViewPatient(row)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          <Eye size={16} />
          Chi tiết
        </button>
      ),
    },
  ]

  return (
    <Card title={`Danh sách bệnh nhân (${patients.length})`}>
      <Table columns={columns} data={patients} />
    </Card>
  )
}

export default PatientTableSection
