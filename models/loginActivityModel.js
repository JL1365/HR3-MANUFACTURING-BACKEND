import mongoose from "mongoose";

const LoginActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, default: null }, // Null for unknown users
  firstName: { type: String, default: "Unknown" },
  lastName: { type: String, default: "Unknown" },
  email: { type: String, required: true }, // Store attempted email
  role: { type: String, default: "Unknown" },
  position: { type: String, default: "Unknown" },
  Hr: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  deviceInfo: { type: String, default: "Unknown" }, 
  loginHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String, required: true },
      device: { type: String, required: true },
      status: { type: String, enum: ["Success", "Failed"], required: true },
    },
  ],
});

export const LoginActivity = mongoose.model("LoginActivity", LoginActivitySchema);
