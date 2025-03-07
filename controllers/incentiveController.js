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

import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { RecognitionProgram } from "../models/recognitionProgramModel.js";
import { EmployeeSalesCommission } from "../models/employeeSalesCommissionModel.js";

import axios from "axios";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";

export const getAllEmployeeIncentiveDetails = async (req, res) => {
    try {
        // Generate service token for authentication
        const serviceToken = generateServiceToken();

        // Fetch user accounts from external API (Admin accounts)
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; // List of users from API

        // Fetch incentive tracking details
        const incentiveTrackings = await IncentiveTracking.find()
            .populate("incentiveId");

        // Fetch recognition programs
        const allRecognitionPrograms = await RecognitionProgram.find();

        // Fetch employee sales status
        // const employeeSalesStatus = await EmployeeSalesCommission.find()
        //     .populate({
        //         path: "salesCommissionId",
        //         select: "salesCommissionName targetAmount"
        //     });

        // Attach user details from external API
        const updatedIncentiveTrackings = incentiveTrackings.map(incentive => {
            const user = users.find(user => user._id.toString() === incentive.userId?.toString());
            return {
                ...incentive.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null,
            };
        });

        const updatedRecognitionPrograms = allRecognitionPrograms.map(program => {
            const user = users.find(user => user._id.toString() === program.userId?.toString());
            return {
                ...program.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null,
            };
        });

        // const updatedEmployeeSalesStatus = employeeSalesStatus.map(sales => {
        //     const user = users.find(user => user._id.toString() === sales.userId?.toString());
        //     return {
        //         ...sales.toObject(),
        //         user: user ? { firstName: user.firstName, lastName: user.lastName } : null,
        //     };
        // });

        // Send response with processed data
        return res.status(200).json({
            incentiveTrackings: updatedIncentiveTrackings,
            allRecognitionPrograms: updatedRecognitionPrograms,
            // employeeSalesStatus: updatedEmployeeSalesStatus
        });

    } catch (error) {
        console.error("Error fetching employee incentive details:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

