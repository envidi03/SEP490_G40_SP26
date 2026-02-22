const mongoose = require("mongoose");
const { Schema } = mongoose;

const leaveRequestSchema = new Schema(
    {
        staff_id: {
            type: Schema.Types.ObjectId,
            ref: "Staff", // Tham chiếu đến nhân viên yêu cầu nghỉ
            required: true
        },
        type: {
            type: String,
            enum: [
                "ANNUAL", 
                "SICK", 
                "MATERNITY", 
                "UNPAID", 
                "BEREAVEMENT", 
                "EMERGENCY"
            ], // Các loại hình nghỉ phép
            required: [true, "Leave type is required"]
        },
        reason: {
            type: String,
            trim: true
        },
        startedDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], // Trạng thái phê duyệt
            default: "PENDING"
        }
    },
    { 
        timestamps: true, // Tự động tạo createdAt và updatedAt
        collection: "leave_requests" 
    }
);

// Index để quản lý và tìm kiếm đơn nghỉ phép theo nhân viên hoặc trạng thái nhanh hơn
leaveRequestSchema.index({ staff_id: 1, status: 1 });
leaveRequestSchema.index({ startedDate: 1, endDate: 1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);