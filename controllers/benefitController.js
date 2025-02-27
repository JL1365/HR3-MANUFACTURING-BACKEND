import mongoose from "mongoose";
import { Benefit } from "../models/benefitModel.js";

export const createBenefit = async (req,res) => {
    try {
        const {benefitName,benefitDescription,benefitType,isNeedRequest} = req.body;

        if(!benefitName ||!benefitDescription||!benefitType){
            return res.status(400).json({message:"All fields are required!"});
        }
        const isBenefitExist = await Benefit.findOne({benefitName});
        if(isBenefitExist){
            return res.status(404).json({message:"Benefit already Exist!"})
        }
        const newBenefit = new Benefit({
            benefitName,
            benefitDescription,
            benefitType,
            isNeedRequest
        });
        await newBenefit.save();
        res.status(201).json({message:"Benefit Created successfully!",newBenefit});
    } catch (error) {
        console.log(`Error in creating benefit: ${error.message}`);
        return res.status(500).json({message:"Internal server error!"});
    }
};

export const getAllBenefits = async (req,res) => {
    try {
        const allBenefits = await Benefit.find({});
        if(allBenefits.length == 0){
            return res.status(404).json({message:"No benefits found!"});
        }
        res.status(200).json({message:"Fetching benefits success:",allBenefits})
    } catch (error) {
        console.log(`Error in fetching benefits: ${error.message}`);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const updateBenefit = async (req, res) => {
    try {
        const { id } = req.params;
        const { benefitName, benefitDescription, benefitType, isNeedRequest } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid benefit ID format." });
        }

        const existingBenefit = await Benefit.findById(id);
        if (!existingBenefit) {
            return res.status(404).json({ status: false, message: "Benefit not found." });
        }

        if (existingBenefit.benefitName !== benefitName) {
            const nameExists = await Benefit.findOne({ benefitName });
            if (nameExists) {
                return res.status(400).json({ status: false, message: "Benefit name already exists." });
            }
        }

        const updatedBenefit = await Benefit.findByIdAndUpdate(
            id,
            { benefitName, benefitDescription, benefitType, isNeedRequest },
            { new: true }
        );

        res.status(200).json({ message: "Updating benefit successful!", updatedBenefit });
    } catch (error) {
        console.log(`Error in updating benefit: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

export const deleteBenefit = async (req,res) => {
    try {
        const {id} = req.params;
        const benefitExist = await Benefit.findById(id);
        if(!benefitExist){
            return res.status(404).json({message:"Benefit not found"});
        }
        const deletedBenefit = await Benefit.findByIdAndDelete(id);
        res.status(200).json({message:"Benefit deleted successfully!",deletedBenefit});  
    } catch (error) {
        console.log(`Error in deleting benefit: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
}

import { BenefitRequest } from "../models/benefitRequestModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";

export const getAllEmployeeBenefitDetails = async (req, res) => {
    try {
        const benefitRequests = await BenefitRequest.find({})
            .populate('userId', 'firstName lastName')
            .populate('benefitId', 'benefitName');

        const benefitDeductions = await BenefitDeduction.find()
            .populate('userId')
            .populate({
                path: 'BenefitRequestId',
                populate: {
                    path: 'benefitId',
                    model: 'Benefit'
                }
            })
            .select("amount createdAt")
            .exec();

        return res.status(200).json({
            benefitRequests,
            benefitDeductions,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching benefit details." });
    }
};

