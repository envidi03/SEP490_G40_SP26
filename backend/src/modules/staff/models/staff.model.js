const mongoose = require("mongoose");
const { Schema } = mongoose;

const staffSchema = new Schema(
    {
        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account", // Tham chiếu tới model Account
            required: true
        },
        profile_id: {
            type: Schema.Types.ObjectId,
            ref: "Profile", // Tham chiếu tới model Profile
            required: true
        },
        work_start: {
            type: Date // Ngày bắt đầu làm việc
        },
        work_end: {
            type: Date // Ngày kết thúc làm việc
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"], // Trạng thái hoạt động
            default: "ACTIVE"
        }
    },
    { 
        timestamps: true, 
        collection: "staffs" 
    }
);

module.exports = mongoose.model("Staff", staffSchema);