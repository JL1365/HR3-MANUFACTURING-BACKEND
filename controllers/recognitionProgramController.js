import { Incentive } from "../models/incentiveModel.js";
import { RecognitionProgram } from "../models/recognitionProgramModel.js";
import { User } from "../models/userModel.js";

export const createRecognitionPrograms = async (req, res) => {
    try {
        const { userId, incentiveId, description, rewardType, rewardValue } = req.body;

        if (!userId || !incentiveId || !rewardType) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const employeeExists = await User.findById(userId);
        if (!employeeExists) {
            return res.status(404).json({ message: "Employee not found." });
        }

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
        const allRecognitionPrograms = await RecognitionProgram.find({})
        .populate('userId','firstName lastName')
        return res.status(200).json(allRecognitionPrograms);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateRecognitionProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { incentiveId, description, rewardType, rewardValue } = req.body;

        const recognition = await RecognitionProgram.findById(id);
        if (!recognition) {
            return res.status(404).json({ message: "Recognition program not found." });
        }

        if (incentiveId) {
            const incentiveExists = await Incentive.findById(incentiveId);
            if (!incentiveExists) {
                return res.status(404).json({ message: "Invalid incentive ID. Incentive not found." });
            }
            recognition.incentiveId = incentiveId;
        }

        if (rewardType && ["Bonus", "Cash"].includes(rewardType)) {
            if (!rewardValue || isNaN(rewardValue) || rewardValue <= 0) {
                return res.status(400).json({ message: "Reward value must be a positive number for Bonus or Cash." });
            }
            recognition.rewardValue = rewardValue;
        }

        recognition.description = description || recognition.description;
        recognition.rewardType = rewardType || recognition.rewardType;

        await recognition.save();

        return res.status(200).json({ message: "Recognition program updated successfully.", data: recognition });
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