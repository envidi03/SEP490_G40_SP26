const mongoose = require('mongoose');
const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
    // Receptionist
    'NEW_APPOINTMENT',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_UPDATE_REQUESTED',   // Bệnh nhân yêu cầu đổi lịch
    'APPOINTMENT_UPDATE_CONFIRMED',   // Xác nhận yêu cầu đổi lịch cho bệnh nhân
    'APPOINTMENT_UPDATE_REJECTED',    // Từ chối yêu cầu đổi lịch cho bệnh nhân
    'APPOINTMENT_NO_SHOW',            // Bệnh nhân vắng mặt - hệ thống tự động
    'INVOICE_READY',
    // Doctor
    'PATIENT_CHECKED_IN',
    // Pharmacist / Inventory
    'NEW_PRESCRIPTION',
    'LOW_STOCK',
    'EXPIRING_MEDICINE',
    // Admin / System
    'SYSTEM_ALERT',
    'SYSTEM_MAINTENANCE',
];

const SCOPE = ['INDIVIDUAL', 'GROUP', 'GLOBAL'];

const notificationSchema = new Schema(
    {
        // ── ĐỊNH DANH VÀ PHÂN LOẠI ──
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            default: null  // null = hệ thống tự động gửi
        },
        scope: {
            type: String,
            enum: SCOPE,
            required: true,
            default: 'INDIVIDUAL'
        },
        type: {
            type: String,
            enum: NOTIFICATION_TYPES,
            required: true,
            index: true
        },

        // ── ĐỐI TƯỢNG NHẬN ──
        // Dùng khi scope = 'INDIVIDUAL' (1 người)
        recipient_id: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
            index: true
        },
        // Dùng khi scope = 'GROUP' theo danh sách ID cụ thể
        recipient_ids: {
            type: [Schema.Types.ObjectId],
            default: []
        },
        // Dùng khi gửi theo chức vụ ('admin', 'doctor', 'receptionist', 'pharmacist')
        target_roles: {
            type: [String],
            default: []
        },
        // Danh sách ID bị loại trừ (không nhận dù thuộc role trên)
        exclude_ids: {
            type: [Schema.Types.ObjectId],
            default: []
        },

        // ── NỘI DUNG HIỂN THỊ ──
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        // Link điều hướng khi người dùng click vào thông báo
        action_url: {
            type: String,
            default: null
        },
        // Ảnh nhỏ hoặc icon hiển thị kèm thông báo
        thumbnail: {
            type: String,
            default: null
        },

        // ── DỮ LIỆU ĐÍNH KÈM (NO-SQL STRENGTH) ──
        metadata: {
            entity_id: {
                type: Schema.Types.ObjectId,
                default: null
            },
            entity_type: {
                type: String,   // VD: 'APPOINTMENT', 'INVOICE', 'MEDICINE'
                default: null
            },
            extra_data: {
                type: Schema.Types.Mixed,
                default: {}
            }
        },

        // ── KÊNH GỬI THÔNG BÁO ──
        channels: {
            // Thông báo nội bộ hệ thống qua Socket.IO (luôn bật)
            in_app: {
                enabled: { type: Boolean, default: true },
                status:  { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
                sent_at: { type: Date, default: null }
            },
            // Gửi email qua Nodemailer
            email: {
                enabled: { type: Boolean, default: false },
                status:  { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
                sent_at: { type: Date, default: null }
            },
            // Gửi Zalo ZNS
            zalo: {
                enabled: { type: Boolean, default: false },
                status:  { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
                sent_at: { type: Date, default: null }
            }
        },

        // ── TRẠNG THÁI (Dành cho thông báo cá nhân - scope INDIVIDUAL) ──
        status: {
            type: String,
            enum: ['UNREAD', 'READ'],
            default: 'UNREAD',
            index: true
        },
        // Đã hiển thị popup/toast cho người dùng thấy hay chưa
        is_seen: {
            type: Boolean,
            default: false
        },

        // ── TRẠNG THÁI (Dành cho thông báo chung/nhóm - scope GROUP, GLOBAL) ──
        // Lưu vết ai đã đọc để tránh hiển thị lại cho họ
        read_by: [
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Account'
                },
                read_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        // Lưu vết ai đã bấm nút "Xóa thông báo" (Ẩn thông báo đi đối với họ)
        deleted_by: [
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Account'
                },
                deleted_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        // Lưu vết ai đã được hiển thị popup (toast) cho thông báo này
        seen_by: [
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Account'
                },
                seen_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        // ── QUẢN LÝ THỜI GIAN ──
        // Thời điểm tự động xóa thông báo (TTL Index) - tránh nặng DB
        expires_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true, collection: 'notifications' }
);

// TTL Index: MongoDB tự xóa document khi đến expires_at
notificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0, sparse: true });

// Index tối ưu truy vấn thông báo theo recipient
notificationSchema.index({ recipient_id: 1, status: 1, createdAt: -1 });
notificationSchema.index({ target_roles: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports.SCOPE = SCOPE;
