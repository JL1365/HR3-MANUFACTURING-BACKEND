import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    violationType: {
      type: String,
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
    comments: {
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
