import mongoose from "mongoose"

const benefitDeductionSchema = mongoose.Schema({
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
        }
},{timestamps:true});

export const BenefitDeduction = mongoose.model("BenefitDeduction",benefitDeductionSchema);