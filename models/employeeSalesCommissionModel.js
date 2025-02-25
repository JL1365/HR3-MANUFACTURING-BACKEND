import mongoose from "mongoose";

const EmployeeSalesCommissionSchema = new mongoose.Schema(
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
    totalSales: { type: Number, default: 0 },
    salesStatus: {
      type: String,
      enum: ["In Progress", "Completed"],
      default: "In Progress",
    },
  },
  { timestamps: true }
);

export const EmployeeSalesCommission = mongoose.model(
  "EmployeeSalesCommission",
  EmployeeSalesCommissionSchema
);
