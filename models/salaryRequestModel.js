import mongoose from "mongoose";

const salaryRequestSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'GCash'],
      required: true,
    },
    gCashNumber: {
      type: String,
      default: null,
      validate: {
        validator: function(value) {
          if (this.paymentMethod === 'GCash') {
            return /^09\d{9}$/.test(value);
          }
          return true;
        },
        message: 'Invalid GCash number. It must start with 09 and have 11 digits.',
      },
    },
    status: {
      type: String,
      enum: ["Pending", "Rejected", "Approved"],
      default: 'Pending',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true });

export const SalaryRequest = mongoose.model("SalaryRequest", salaryRequestSchema);
