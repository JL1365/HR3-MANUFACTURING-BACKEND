import mongoose from "mongoose";

const benefitSchema = await mongoose.Schema({
    benefitName:{
        type:String,
        required:true,
        unique:true
    },
    benefitDescription:{
        type:String,
        required:true,
    },
    benefitType:{
        type: String,
        enum: ['Compensation', 'Health','Financial','Others'],
        required: true
    },
    isNeedRequest:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

export const Benefit = mongoose.model("Benefit",benefitSchema);