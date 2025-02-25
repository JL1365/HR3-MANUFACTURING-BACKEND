import mongoose from "mongoose";

const SalesCommissionSchema = new mongoose.Schema({
    salesCommissionName: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    commissionRate: {
        type: Number,
        required: true
    },
    assignedTo: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        assignStatus: { 
            type: String, 
            enum: ["Pending", "Assigned"], 
            default: "Pending" 
        }
    }],
    status: {
        type: String,
        enum: ["Available", "Not Available"],
        default: "Available"
    },
}, { timestamps: true });

export const SalesCommission = mongoose.model("SalesCommission", SalesCommissionSchema);
