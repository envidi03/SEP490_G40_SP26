const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema(
    {
        room_number: {
            type: String,
            required: [true, 'Room number is required'],
            unique: true, 
            trim: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
            default: "ACTIVE"
        },

        room_service: [
            {
                service_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Service", 
                    required: true
                },
                note: {
                    type: String
                }
            }
        ],
        
        history_used: [
            {
                used_date: {
                    type: Date,
                    required: true
                },
                doctor_use: {
                    type: Schema.Types.ObjectId,
                    ref: "Staff" 
                },
                note: {
                    type: String
                }
            }
        ],
        note: {
            type: String
        },
        clinic_id: {
            type: Schema.Types.ObjectId,
            ref: "Clinic", 
            required: true
        }
    },
    { 
        timestamps: true, 
        collection: "rooms" 
    }
);

roomSchema.index({ room_number: 1 });

module.exports = mongoose.model("Room", roomSchema);