import mongoose from "mongoose";

const standardCompensationSchema = new mongoose.Schema({
    standardName: {
        type: String,
        required: true
    },
    standardDescription: {
        type: String,
        default: "Standard company benefits for all employees."
    },
    standardStatus: {
        type: Boolean,
        required: true,
        default: true
    }
}, { timestamps: true });

export const StandardCompensation = mongoose.model("StandardCompensation", standardCompensationSchema);
