const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },

        // Danh sách các quyền mà vai trò này có
        permissions: [
            {
                type: Schema.Types.ObjectId, ref: "Permission"
            }
        ],

        // is_system = true nghĩa là vai trò mặc định của hệ thống, không cho phép User xóa
        is_system: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    { timestamps: true, collection: "roles" }
);

module.exports = mongoose.model("Role", roleSchema);