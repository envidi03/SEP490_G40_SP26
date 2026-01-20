const mongoose = require("mongoose");
const { Schema } = mongoose;

const permissionSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        module: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
    },
    { timestamps: true, collection: "permissions" }
);

// Index để query nhanh permissions theo module
permissionSchema.index({ module: 1 });

module.exports = mongoose.model("Permission", permissionSchema);