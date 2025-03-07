import mongoose from "mongoose";
import { Benefit } from "../models/benefitModel.js";
import axios from 'axios'

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
    // Get approved benefit requests
    const benefitRequests = await BenefitRequest.find({status:"Approved"})
      .populate('benefitId', 'benefitName');

    // Get benefit deductions
    const benefitDeductions = await BenefitDeduction.find()
      .populate({
        path: 'BenefitRequestId',
        populate: {
          path: 'benefitId',
          model: 'Benefit'
        }
      })
      .select("amount createdAt")
      .exec();

    // Generate service token for API authentication
    const serviceToken = generateServiceToken();

    // Fetch users from the external API
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;


    const mappedBenefitRequests = benefitRequests.map(request => {
      const userId = request.userId.toString();
      const user = users.find(u => u._id === userId);
      
      return {
        ...request.toObject(),
        userId: user ? { 
          _id: userId,//
          firstName: user.firstName,
          lastName: user.lastName
        } : null
      };
    });
    

    const mappedBenefitDeductions = benefitDeductions.map(deduction => {
      return {
        ...deduction.toObject()
      };
    });

    return res.status(200).json({
      benefitRequests: mappedBenefitRequests,
      benefitDeductions: mappedBenefitDeductions,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching benefit details." });
  }
};
import { BenefitDocument } from "../models/admin/benefitDocumentsModel.js";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";

export const uploadDocument = async (req, res) => {
  try {
    console.log(req.file); 

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { description,remarks } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const fileUrl = req.file.path;

    const newDocument = new BenefitDocument({
      documentFile: fileUrl,
      description,
      remarks:remarks || "",
    });

    await newDocument.save();

    res.status(200).json({ message: 'File uploaded successfully', document: newDocument });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

export const getUploadedDocuments = async (req, res) => {
  try {
    const documents = await BenefitDocument.find({});
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found!" });
    }
    res.status(200).json({ message: "Fetching documents success:", documents });
  } catch (error) {
    console.log(`Error in fetching documents: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
