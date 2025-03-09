import mongoose from "mongoose";

const PageVisitSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String },
  lastName: { type: String },
  pageName: { type: String, required: true },
  duration: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const PageVisit = mongoose.model("PageVisit", PageVisitSchema);
