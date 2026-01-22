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
        
        history_used: [
            {
                use_start: {
                    type: Date,
                    required: true
                },
                use_end: {
                    type: Date
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