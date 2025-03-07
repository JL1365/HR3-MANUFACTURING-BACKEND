import { BenefitRequest } from "../models/benefitRequestModel.js";
import { Benefit } from "../models/benefitModel.js";
import upload from '../config/multerConfig.js';
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import axios from 'axios'

export const applyBenefit = async (req, res) => {
    try {
      const userId = req.user._id;
      const { benefitId } = req.body;
  
      if (!benefitId) {
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

    const users = response.data;
    const employeeExists = users.find(user => user._id === userId);
  
      const existingRequest = await BenefitRequest.findOne({ userId, benefitId });
      if (existingRequest) {
        return res.status(400).json({
          message: "You have already requested this benefit.",
        });
      }
  
   
      const benefit = await Benefit.findById(benefitId);
      if (!benefit) {
        return res.status(404).json({
          message: "Benefit not found.",
        });
      }
  
   
      if (benefit.isNeedRequest) {
     
        if (!req.files || !req.files.frontId || !req.files.backId) {
          return res.status(400).json({
            message: "Please upload both front and back ID images.",
          });
        }
      }
  
      const frontIdUrl = req.files.frontId ? req.files.frontId[0].path : null;
      const backIdUrl = req.files.backId ? req.files.backId[0].path : null;
  
      const newRequest = new BenefitRequest({
        userId,
        benefitId,
        uploadDocs: {
          frontId: frontIdUrl,
          backId: backIdUrl,
        },
        status: "Pending",
      });
  
      await newRequest.save();
  
      res.status(201).json({message: "Benefit request submitted successfully",requestId: newRequest._id,});
    } catch (error) {
      console.error(`Error in applying benefit: ${error.message}`);
      res.status(500).json({message: "Internal server error",});
    }
  };
  
export { upload };


export const getMyApplyRequests = async (req,res) => {
    try {
        if(!req.user || !req.user._id){
            return res.status(401).json({message:'User not authenticated.'});
        }
        const myApplyRequests = await BenefitRequest.find({ userId: req.user._id})
        .populate("benefitId","benefitName")
        res.status(200).json({status:true,myApplyRequests})
    } catch (error) {
        console.log(`Error in getting my apply request: ${error.message}`);
        return res.status(500).json({message:"Internal server error"});
    }
};


export const getAllAppliedRequest = async (req, res) => {
    try {
        // Fetch all benefit requests
        const allRequestBenefit = await BenefitRequest.find({})
        .populate("benefitId")


        if (allRequestBenefit.length === 0) {
            return res.status(404).json({ message: "No request found!" });
        }

        // Generate service token
        const serviceToken = generateServiceToken();

        // Fetch user accounts from external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data.accounts || response.data; // Adjust based on actual response

        // Map requests with admin user details
        const updatedRequestBenefit = allRequestBenefit.map((requestBenefit) => {
            const user = users.find(
                (user) => user._id.toString() === requestBenefit.userId.toString()
            );

            return {
                ...requestBenefit.toObject(),
                user: user
                    ? { firstName: user.firstName, lastName: user.lastName ,position:user.position }
                    : { firstName: "Unknown", lastName: "User" },
            };
        });

        res.status(200).json({ status: true, updatedRequestBenefit });
    } catch (error) {
        console.error(`Error in getting all applied requests: ${error.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAppliedRequestCount = async (req, res) => {
  try {
      // Get total applied requests count
      const totalAppliedRequests = await BenefitRequest.countDocuments();

      // Get new requests within 1 day
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const newRequestsCount = await BenefitRequest.countDocuments({
          createdAt: { $gte: oneDayAgo }
      });

      // Get count of approved requests
      const approvedCount = await BenefitRequest.countDocuments({ status: "Approved" });

      // Get count of denied requests
      const deniedCount = await BenefitRequest.countDocuments({ status: "Denied" });
      const pendingCount = await BenefitRequest.countDocuments({ status: "Pending" });

      res.status(200).json({ 
          status: true, 
          totalAppliedRequests, 
          newRequestsCount,
          approvedCount,
          deniedCount,
          pendingCount
      });

  } catch (error) {
      console.error(`Error in getting applied request count: ${error.message}`);
      return res.status(500).json({ message: "Internal server error" });
  }
};



export const updateApplyRequestStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body;

    const validStatuses = ["Approved", "Denied", "Pending"];
    const finalStatuses = ["Approved", "Denied"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status provided. Status must be one of: Approved, Denied, Pending.",
      });
    }

    const currentRequest = await BenefitRequest.findById(id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Benefit request not found." });
    }

    if (finalStatuses.includes(currentRequest.status)) {
      return res.status(400).json({message: `Cannot change status from ${currentRequest.status}. It has already been finalized.`,});
    }

    const updatedRequest = await BenefitRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({message: "Benefit request status updated successfully.",updatedRequest,});
  } catch (error) {
    console.error(`Error in Updating request status: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateMyUploadedDocs = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const { requestId } = req.params;
    const currentRequest = await BenefitRequest.findById(requestId);
    
    if (!currentRequest) {
      return res.status(404).json({ message: "Benefit request not found." });
    }

    const requestAge = new Date() - currentRequest.createdAt;
    const fifteenMinutes = 15 * 60 * 1000;

    if (requestAge > fifteenMinutes) {
      return res.status(403).json({ message: "Cannot update uploaded documents after 15 minutes." });
    }

    const updatedDocs = { uploadDocs: {} };
    if (req.files.frontId) {
      updatedDocs.uploadDocs.frontId = req.files.frontId[0].path;
    }
    if (req.files.backId) {
      updatedDocs.uploadDocs.backId = req.files.backId[0].path;
    }

    if (Object.keys(updatedDocs.uploadDocs).length === 0) {
      return res.status(400).json({ message: "No new documents provided for update." });
    }

    const updatedRequest = await BenefitRequest.findByIdAndUpdate(
      requestId,
      { $set: updatedDocs },
      { new: true }
    );

    res.status(200).json({message: "Uploaded documents updated successfully.",updatedRequest,});
  } catch (error) {
    console.error(`Error in updating uploaded documents: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
