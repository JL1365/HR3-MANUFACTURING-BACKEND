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
    dateReceived: {  
        type: Date, 
    }, 
    status: { 
        type: String, 
        enum: ["Pending", "Received"], 
        default: "Pending" 
    }, 
    processedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    isAlreadyAdded: { 
        type: Boolean, 
        default: false
    }
});

export const IncentiveTracking = mongoose.model("IncentiveTracking", incentiveTrackingSchema);
