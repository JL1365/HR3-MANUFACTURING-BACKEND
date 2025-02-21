import mongoose from "mongoose";

const benefitRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    benefitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Benefit",
    },
    uploadDocs: {
      frontId: { type: String},
      backId: { type: String},
    },
    status:{
      type:String,
      enum:["Approved","Denied","Pending"],
      default:"Pending"
    }
  },
  { timestamps: true }
);

export const BenefitRequest = mongoose.model(
  "BenefitRequest",
  benefitRequestSchema
);
