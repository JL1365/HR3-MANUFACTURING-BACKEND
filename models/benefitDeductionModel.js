import mongoose from "mongoose"

const benefitDeductionSchema =new mongoose.Schema({
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        BenefitRequestId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "BenefitRequest",
        },
        amount:{
            type:Number,
            required:true
        },
        isAlreadyAdded: { 
          type: Boolean, 
          default: false 
      }
},{timestamps:true});

export const BenefitDeduction = mongoose.model("BenefitDeduction",benefitDeductionSchema);