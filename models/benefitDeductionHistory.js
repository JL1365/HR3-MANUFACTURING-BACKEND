import mongoose from "mongoose";

const benefitDeductionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  benefitRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "BenefitRequest",
  },
  totalAmount: { 
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

export const BenefitDeductionHistory = mongoose.model("BenefitDeductionHistory", benefitDeductionHistorySchema);
