import mongoose from "mongoose";
import { Incentive } from "../models/incentiveModel.js";

export const createIncentive = async (req,res) => {
    try {
        const {incentiveName,incentiveDescription,incentiveType} = req.body;

        if(!incentiveName ||!incentiveDescription||!incentiveType){
            return res.status(400).json({message:"All fields are required!"});
        }
        const isIncentiveExist = await Incentive.findOne({incentiveName});
        if(isIncentiveExist){
            return res.status(404).json({message:"Incentive already Exist!"})
        }
        const newIncentive = new Incentive({
            incentiveName,
            incentiveDescription,
            incentiveType,
        });
        await newIncentive.save();
        res.status(201).json({message:"Incentive Created successfully!",newIncentive});
    } catch (error) {
        console.log(`Error in creating incentive: ${error.message}`);
        return res.status(500).json({message:"Internal server error!"});
    }
};

export const getAllIncentives = async (req,res) => {
    try {
        const allIncentives = await Incentive.find({});
        if(allIncentives.length == 0){
            return res.status(404).json({message:"No incentives found!"});
        }
        res.status(200).json({message:"Fetching incentives success:",allIncentives})
    } catch (error) {
        console.log(`Error in fetching incentives: ${error.message}`);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const updateIncentive = async (req, res) => {
    try {
        const { id } = req.params;
        const { incentiveName, incentiveDescription, incentiveType} = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid incentive ID format." });
        }

        const existingIncentive = await Incentive.findById(id);
        if (!existingIncentive) {
            return res.status(404).json({ status: false, message: "Incentive not found." });
        }

        if (existingIncentive.incentiveName !== incentiveName) {
            const nameExists = await Incentive.findOne({ incentiveName });
            if (nameExists) {
                return res.status(400).json({ status: false, message: "Incentive name already exists." });
            }
        }

        const updatedIncentive = await Incentive.findByIdAndUpdate(
            id,
            { incentiveName, incentiveDescription, incentiveType},
            { new: true }
        );

        res.status(200).json({ message: "Updating benefit successful!", updatedIncentive });
    } catch (error) {
        console.log(`Error in updating incentive: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

export const deleteIncentive = async (req,res) => {
    try {
        const {id} = req.params;
        const incentiveExist = await Incentive.findById(id);
        if(!incentiveExist){
            return res.status(404).json({message:"Incentive not found"});
        }
        const deletedIncentive = await Incentive.findByIdAndDelete(id);
        res.status(200).json({message:"Incentive deleted successfully!",deletedIncentive});  
    } catch (error) {
        console.log(`Error in deleting incentive: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
}