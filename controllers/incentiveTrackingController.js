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
        const incentiveTrackings = await IncentiveTracking.find().populate('userId incentiveId');
        res.json({ allIncentivesTracking: incentiveTrackings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch incentive tracking" });
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

export const updateIncentiveTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description,earnedDate } = req.body;

        const existingTracking = await IncentiveTracking.findById(id);
        if (!existingTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        const updatedTracking = await IncentiveTracking.findByIdAndUpdate(
            id,
            { amount, description,earnedDate },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Incentive tracking updated successfully!", data: updatedTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateMyIncentiveTrackingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const existingTracking = await IncentiveTracking.findById(id);
        if (!existingTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        if (status !== "Received") {
            return res.status(403).json({ success: false, message: "Employees can only mark incentives as Received!" });
        }

        const updateFields = { status: "Received" };
        if (!existingTracking.dateReceived) {
            updateFields.dateReceived = new Date();
        }

        const updatedTracking = await IncentiveTracking.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Incentive marked as received!", data: updatedTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


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
