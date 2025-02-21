import { BenefitRequest } from "../models/benefitRequestModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { BenefitDeductionHistory } from "../models/benefitDeductionHistory.js";

export const addUserDeduction = async (req, res) => {
  try {
    const { userId, benefitRequestId, amount } = req.body;

    if (!userId || !benefitRequestId || amount == null || isNaN(amount)) {
      return res.status(400).json({
        message: "User ID, benefit request ID, and a valid numeric amount are required.",
      });
    }

    const numericAmount = parseFloat(amount);

    // Find the associated benefit request for the user
    const benefitRequest = await BenefitRequest.findOne({
      _id: benefitRequestId,
      userId,
      status: "Approved", // Only look for approved requests
    });

    // Check if the benefit request is found and approved
    if (!benefitRequest) {
      return res.status(400).json({message: "You cannot add a deduction because the benefit request is not approved.",});}

    const newDeduction = new BenefitDeduction({
      userId,
      benefitId: benefitRequest.benefitId,
      BenefitRequestId: benefitRequest._id,
      amount: numericAmount,
    });

    await newDeduction.save();

    // Check for existing history record
    let deductionHistory = await BenefitDeductionHistory.findOne({
      userId,
      benefitRequestId: benefitRequest._id, // Match by user and benefit request
    });

    if (deductionHistory) {
      // If a history record exists, update the total
      deductionHistory.totalAmount += numericAmount;
      await deductionHistory.save();
    } else {
      // If no history record exists, create a new one
      deductionHistory = new BenefitDeductionHistory({
        userId,
        benefitRequestId: benefitRequest._id,
        totalAmount: numericAmount, 
      });

      await deductionHistory.save();
    }

    res.status(201).json({
      message: "Deduction added successfully.",
      deduction: newDeduction,
      deductionHistory,
    });
  } catch (error) {
    console.error(`Error in adding user deduction: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMyDeduction = async (req, res) => {
  try {
    if(!req.user || !req.user._id){
        return res.status(401).json({message:'User not authenticated.'});
    }
    const userId = req.user._id;
    const myDeductions = await BenefitDeduction.find({ userId })
      .populate('BenefitRequestId')
      .exec();

    if (myDeductions.length === 0) {
      return res.status(404).json({message: "No deductions found for this user.",});
    }

    res.status(200).json({message: "Deductions retrieved successfully.",myDeductions});
  } catch (error) {
    console.error(`Error in fetching deductions: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllBenefitDeductions = async (req, res) => {
  try {
    // Fetch all benefit deductions
    const allDeductions = await BenefitDeduction.find()
      .populate('userId')
      .populate('BenefitRequestId')
      .exec();

    if (allDeductions.length === 0) {
      return res.status(404).json({message: "No benefit deductions found.",});
    }

    res.status(200).json({message: "All benefit deductions retrieved successfully.",deductions: allDeductions,});
  } catch (error) {
    console.error(`Error in fetching all benefit deductions: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
