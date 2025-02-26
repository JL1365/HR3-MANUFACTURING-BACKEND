import mongoose from "mongoose";

const compensationPlanningSchema = new mongoose.Schema({
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    overTimeRate: {
        type: Number,
        required: true
    },
    holidayRate: {
        type: Number,
        required: true
    },
    allowances: [{
        type: { type: String, required: true },  
        amount: { type: Number, required: true }
    }],
    approvalStatus: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending'
    },
}, { timestamps: true });

export const CompensationPlanning = mongoose.model("CompensationPlanning", compensationPlanningSchema);
