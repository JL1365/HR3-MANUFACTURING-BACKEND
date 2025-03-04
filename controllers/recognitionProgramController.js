import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import { Incentive } from "../models/incentiveModel.js";
import { RecognitionProgram } from "../models/recognitionProgramModel.js";
import { User } from "../models/userModel.js";

import axios from "axios";

export const createRecognitionPrograms = async (req, res) => {
    try {
        const { userId, incentiveId, description, rewardType, rewardValue } = req.body;

        if (!userId || !incentiveId || !rewardType) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Generate service token
        const serviceToken = generateServiceToken();
        // Fetch user from external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; // Get users from API response
        const employeeExists = users.find(user => user._id === userId);

        if (!employeeExists) {
            return res.status(404).json({ message: "Employee not found." });
        }

        // Check if incentive exists
        const incentiveExists = await Incentive.findById(incentiveId);
        if (!incentiveExists) {
            return res.status(404).json({ message: "Incentive not found." });
        }

        let finalRewardValue = null;

        if (["Bonus", "Cash"].includes(rewardType)) {
            if (!rewardValue || isNaN(rewardValue) || rewardValue <= 0) {
                return res.status(400).json({ message: "Reward value is required and must be a positive number for Bonus or Cash." });
            }
            finalRewardValue = rewardValue;
        }

        // Create a new recognition program
        const newRecognition = new RecognitionProgram({
            userId,
            incentiveId,
            description,
            rewardType,
            rewardValue: finalRewardValue,
        });

        await newRecognition.save();

        return res.status(201).json({ message: "Recognition program created successfully.", data: newRecognition });
    } catch (error) {
        console.error("Error creating recognition program:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllRecognitionPrograms = async (req, res) => {
    try {
        // Fetch all recognition programs from the database
        const allRecognitionPrograms = await RecognitionProgram.find({});

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
        const updatedRecognitionPrograms = allRecognitionPrograms.map(recognition => {
            const user = users.find(user => user._id === recognition.userId.toString());
            return {
                ...recognition.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null
            };
        });
        

        return res.status(200).json(updatedRecognitionPrograms);
    } catch (error) {
        console.error("Error fetching recognition programs:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateRecognitionProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { incentiveId, description, rewardType, rewardValue, userId } = req.body;

        // Find the existing recognition program
        const recognition = await RecognitionProgram.findById(id);
        if (!recognition) {
            return res.status(404).json({ message: "Recognition program not found." });
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

        console.log("User found:", userExists); // Log user data for debugging

        // If incentiveId is provided, check if it exists in the Incentive collection
        if (incentiveId) {
            const incentiveExists = await Incentive.findById(incentiveId);
            if (!incentiveExists) {
                return res.status(404).json({ message: "Invalid incentive ID. Incentive not found." });
            }
        }

        // Validate rewardType and rewardValue
        if (rewardType && ["Bonus", "Cash"].includes(rewardType)) {
            if (!rewardValue || isNaN(rewardValue) || rewardValue <= 0) {
                return res.status(400).json({ message: "Reward value must be a positive number for Bonus or Cash." });
            }
        }

        // Update the recognition program with the new data
        const updatedRecognitionProgram = await RecognitionProgram.findByIdAndUpdate(
            id,
            {
                incentiveId,
                description,
                rewardType,
                rewardValue,
                userId, // Ensure userId is updated
            },
            { new: true, runValidators: true }
        );

        // Check if the program was updated successfully
        if (!updatedRecognitionProgram) {
            return res.status(404).json({ message: "Failed to update recognition program." });
        }

        // Respond with the updated recognition program
        return res.status(200).json({
            message: "Recognition program updated successfully.",
            data: updatedRecognitionProgram,
        });

    } catch (error) {
        console.error("Error updating recognition program:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getMyRecognitionAwards = async (req, res) => {
    try {
        if(!req.user || !req.user._id){
            return res.status(401).json({message:'User not authenticated.'});
        }

        const myRecognitions = await RecognitionProgram.find({ userId: req.user._id})
        .populate("incentiveId", "incentiveName")
      .exec()

        return res.status(200).json({ data:myRecognitions });
    } catch (error) {
        console.error("Error fetching recognition programs:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteRecognitionProgram = async (req,res) => {
    try {
        const {id} = req.params;
        const isRecognitionProgramExist = await RecognitionProgram.findById(id);
        if(!isRecognitionProgramExist){
            return res.status(404).json({message:"Recognition Program not found"});
        }
        const deletedRecognitionProgram = await RecognitionProgram.findByIdAndDelete(id);
        res.status(200).json({message:"RecognitionProgram deleted successfully!",deletedRecognitionProgram});  
    } catch (error) {
        console.log(`Error in deleting RecognitionProgram: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
}