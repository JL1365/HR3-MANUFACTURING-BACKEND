import mongoose from "mongoose";

const incentiveTrackingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    incentiveId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Incentive", 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },  
    description: { 
        type: String 
    }, 
    earnedDate: {
        type: Date, 
        required: true 
    },
    dateGiven: {  
        type: Date, 
        default: Date.now 
    }, 
    status: { 
        type: String, 
        enum: ["Pending", "Given"], 
        default: "Pending" 
    }, 
    processedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
});

export const IncentiveTracking = mongoose.model("IncentiveTracking", incentiveTrackingSchema);
