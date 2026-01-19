const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const clinicSchema = new Schema(
    {
        clinic_name: {
            type: String,
            required: true,
            trim: true
        },
        clinic_address: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            sparse: true,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^(0|\+84)[0-9]{9}$/.test(v);
                },
                message: 'Số điện thoại không hợp lệ (phải là 10 số bắt đầu bằng 0 hoặc +84)'
            }
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: 'Email không hợp lệ'
            }
        },
        working_house: {
            type: String,
            required: true
        },
        tax_code: {
            type: String,
            required: true,
            trim: true, 
            validate: {
                validator: function (v) {
                    return /^[0-9]{10,13}$/.test(v);
                },
                message: 'Mã số thuế không hợp lệ (phải là chuỗi từ 10 đến 13 chữ số)'
            }
        }, 
        license_number: {
            type: String,
            required: true,
            trim: true, 
            validate: {
                validator: function (v) {
                    return /^[A-Z0-9]{5,50}$/.test(v);
                },
                message: 'Số giấy phép không hợp lệ (phải là chuỗi từ 5 đến 50 ký tự in hoa và chữ số)'
            }
        }, 
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }, 
        status: {
            type: String,
            default: "ACTIVE",
            enum: ["ACTIVE", "INACTIVE"],
            required: true
        }
    },
    { timestamps: true, collection: "clinics" }
);

module.exports = mongoose.model("Clinic", clinicSchema);