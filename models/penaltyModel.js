import mongoose from "mongoose";

const penaltySchema = new mongoose.Schema({
  violationType: {
    type: String,
    required: true
  },
  penaltyLevel: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  consequence: {
    type: String,
    required: true
  },
},{timestamps:true});

export const PenaltyLevel = mongoose.model('PenaltyLevel', penaltySchema);
