import mongoose from "mongoose";

const requestSettingsSchema = new mongoose.Schema({
    isAvailable: {
        type: Boolean,
        default: false
    }
});

export const RequestSettings = mongoose.model("RequestSettings", requestSettingsSchema);
