import mongoose from "mongoose";

const SalesHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salesCommissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesCommission",
      required: true,
    },
    salesAmount: { type: Number, required: true },
    salesProof: [
      { url: String, uploadedAt: { type: Date, default: Date.now } },
    ],
    confirmationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const SalesHistory = mongoose.model("SalesHistory", SalesHistorySchema);
