import { Incentive } from "../models/incentiveModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { User } from "../models/userModel.js";

export const createIncentiveTracking = async (req, res) => {
    try {
        const { userId, incentiveId, amount, description, earnedDate } = req.body;
        const processedBy = req.user.id;

        const userExists = await User.findById(userId);
        const incentiveExists = await Incentive.findById(incentiveId);

        if (!userExists || !incentiveExists) {
            return res.status(404).json({ success: false, message: "User or Incentive not found!" });
        }

        const newTracking = new IncentiveTracking({
            userId,
            incentiveId,
            amount,
            description,
            earnedDate,
            processedBy,
            status: "Pending"
        });

        await newTracking.save();
        res.status(201).json({ success: true, message: "Incentive recorded successfully!", data: newTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllIncentiveTracking = async (req, res) => {
    try {
        const allIncentivesTracking = await IncentiveTracking.find()
            .populate("userId", "name email")
            .populate("incentiveId", "incentiveName incentiveType");

        res.status(200).json({ success: true, data: allIncentivesTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getMyIncentiveTracking = async (req, res) => {
    try {
        if(!req.user || !req.user._id){
            return res.status(401).json({message:'User not authenticated.'});
        }
        const myIncentivesTracking = await IncentiveTracking.find({ userId: req.user._id })
            .populate("incentiveId", "incentiveName incentiveType amount dateGiven status");

        res.status(200).json({ success: true, data: myIncentivesTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Update Incentive Tracking Entry
export const updateIncentiveTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, status } = req.body;

        const updatedTracking = await IncentiveTracking.findByIdAndUpdate(
            id,
            { amount, description, status },
            { new: true, runValidators: true }
        );

        if (!updatedTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        res.status(200).json({ success: true, message: "Incentive tracking updated successfully!", data: updatedTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Delete Incentive Tracking Entry
export const deleteIncentiveTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTracking = await IncentiveTracking.findByIdAndDelete(id);

        if (!deletedTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        res.status(200).json({ success: true, message: "Incentive tracking record deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
