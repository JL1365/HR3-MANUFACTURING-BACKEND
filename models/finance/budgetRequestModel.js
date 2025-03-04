import mongoose from "mongoose";

const budgetRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String},
    department: { 
      type: String, 
      required: true,
      enum: ["Logistic1", "HR3", "HR4"], 
    },
    status: { 
      type: String, 
      required: true, 
    },
    totalBudget: { type: Number, required: true }, 
    category: { type: String, required: true },
    reason: { type: String, required: true },
    documents: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.*\.pdf$/i.test(v);
        },
        message: props => `${props.value} is not a valid PDF URL!`
      }
    },
    comment: { type: String }
  },
  { timestamps: true }
);

export const BudgetRequest = mongoose.model("BudgetRequest", budgetRequestSchema);
