import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import { Incentive } from "../models/incentiveModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { User } from "../models/userModel.js";

import axios from 'axios';  // Ensure axios is imported

export const createIncentiveTracking = async (req, res) => {
    try {
        const { userId, incentiveId, amount, description, earnedDate } = req.body;
        const processedBy = req.user.id;

        // Generate service token
        const serviceToken = generateServiceToken();

        // Fetch users from external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; // Get the list of users from the API

        // Check if the user exists in the external data
        const userExists = users.find(user => user._id === userId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Check if incentive exists
        const incentiveExists = await Incentive.findById(incentiveId);
        if (!incentiveExists) {
            return res.status(404).json({ success: false, message: "Incentive not found!" });
        }

        // Create a new incentive tracking record
        const newTracking = new IncentiveTracking({
            userId,
            incentiveId,
            amount,
            description,
            earnedDate,
            processedBy,
            status: "Pending",
        });

        await newTracking.save();
        return res.status(201).json({ success: true, message: "Incentive recorded successfully!", data: newTracking });
    } catch (error) {
        console.error("Error creating incentive tracking:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllIncentiveTracking = async (req, res) => {
    try {
        // Fetch all recognition programs from the database
        const allIncentivesTracking = await IncentiveTracking.find({});

        // Generate service token
        const serviceToken = generateServiceToken();

        // Fetch users from external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; // Listahan ng users mula sa API

        // Attach user firstName and lastName to recognition programs
        const updatedIncentiveTrackings = allIncentivesTracking.map(tracking => {
            const user = users.find(user => user._id === tracking.userId.toString());
            return {
                ...tracking.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null
            };
        });
        

        return res.status(200).json(updatedIncentiveTrackings);
    } catch (error) {
        console.error("Error fetching recognition programs:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
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
        const { amount, description, earnedDate, userId } = req.body;

        // Find the existing incentive tracking record
        const existingTracking = await IncentiveTracking.findById(id);
        if (!existingTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        // Generate service token
        const serviceToken = generateServiceToken();

        // Fetch the user details from the external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`, 
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data; // Get the list of users from the API

        // Check if the user exists in the external data
        const userExists = users.find(user => user._id === userId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Update the incentive tracking record with the new information
        const updatedTracking = await IncentiveTracking.findByIdAndUpdate(
            id,
            {
                amount,
                description,
                earnedDate,
                userId, // Updating the userId in the record
                user: { firstName: userExists.firstName, lastName: userExists.lastName }, // Updating user firstName and lastName
            },
            { new: true, runValidators: true }
        );

        // Respond with the updated incentive tracking record
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
