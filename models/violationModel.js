import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    penaltyLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PenaltyLevel", 
      required: true,
    },
    violationDate: {
      type: Date,
      required: true,
    },
    sanctions: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    }
  },
  { timestamps: true }
);

export const Violation = mongoose.model('Violation', violationSchema);
