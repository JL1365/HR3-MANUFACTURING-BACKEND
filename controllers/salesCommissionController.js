import { SalesCommission } from "../models/salesCommissionModel.js";

export const createSalesCommission = async (req, res) => {
    try {
        const { salesCommissionName, targetAmount, commissionRate, status,assignedTo } = req.body;
        
        if (!salesCommissionName || !targetAmount || !commissionRate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newCommission = new SalesCommission({
            salesCommissionName,
            targetAmount,
            commissionRate,
            status: status || "Not Available",
            assignedTo
        });

        await newCommission.save();
        return res.status(201).json({ message: "Sales Commission created successfully.", commission: newCommission });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAllSalesCommission = async (req, res) => {
    try {
        const allSalesCommissions = await SalesCommission.find().populate("assignedTo.userId", "firstName lastName");

        if(allSalesCommissions.length === 0) {
            return res.status(404).json("No sales Commission found!")
        }
        return res.status(200).json(allSalesCommissions);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateSalesCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const { salesCommissionName, targetAmount, commissionRate, status } = req.body;

        const updatedCommission = await SalesCommission.findByIdAndUpdate(
            id,
            { salesCommissionName, targetAmount, commissionRate, status },
            { new: true, runValidators: true }
        );

        if (!updatedCommission) {
            return res.status(404).json({ message: "Sales Commission not found." });
        }

        return res.status(200).json({ message: "Sales Commission updated successfully.", commission: updatedCommission });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const deleteSalesCommission = async (req,res) => {
   try {
        const {id} = req.params;
        const issalesCommissionExist = await SalesCommission.findById(id);
        if(!issalesCommissionExist){
            return res.status(404).json({message:"Sales commission not found"});
        }
        const deletedSalesCommission = await SalesCommission.findByIdAndDelete(id);
        res.status(200).json({message:"Sales Commission deleted successfully!",deletedSalesCommission});  
    } catch (error) {
        console.log(`Error in deleting Sales Commission: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
} 

import {User} from '../models/userModel.js'
import { EmployeeSalesCommission } from "../models/employeeSalesCommissionModel.js";
import { SalesHistory } from "../models/salesHistoryModel.js";
import upload from "../config/multerConfig.js";
import mongoose from 'mongoose'
import cloudinary from "../config/cloudinaryConfig.js";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";

//EMPLOYEE SALES
export const assignSalesCommission = async (req, res) => {
    try {
        const { salesCommissionId } = req.body;
        const userId = req.user;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        if (!salesCommissionId) {
            return res.status(400).json({ message: "Sales commission ID is required." });
        }
/* 
        const existingEmployee = await User.findById(userId);
        if (!existingEmployee) {
            return res.status(404).json({ message: "Employee not found." });
        } */

        const existingCommission = await SalesCommission.findById(salesCommissionId);
        if (!existingCommission) {
            return res.status(404).json({ message: "Sales commission not found." });
        }

        if (existingCommission.status === "Not Available") {
            return res.status(400).json({ message: "This sales commission is not available for assignment." });
        }

        const existingRecord = await EmployeeSalesCommission.findOne({ userId, salesCommissionId });

        if (existingRecord) {
            return res.status(400).json({ message: "You already have this sales commission assigned." });
        }

        const newAssignment = new EmployeeSalesCommission({
            userId,
            salesCommissionId,
            totalSales: 0,
            salesStatus: "In Progress"
        });

        await newAssignment.save();

        existingCommission.assignedTo.push({
            userId: userId,
            assignStatus: "Assigned"
        });

        await existingCommission.save();

        return res.status(201).json({ 
            message: "Sales commission assigned successfully.", 
            assignment: newAssignment 
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getMyAssignedSalesCommissions = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const userId = req.user._id;

        const assignedCommissions = await SalesCommission.find({
            "assignedTo.userId": userId, 
            "assignedTo.assignStatus": { $in: ["Assigned", "Not Assigned"] }
        }).populate("assignedTo.userId");

        return res.status(200).json({
            message: "Your assigned and not assigned sales commissions retrieved successfully.",
            assignedCommissions,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const addMySalesCommission = async (req, res) => {
    try {
        const { salesCommissionId, salesAmount } = req.body;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const myCommission = await EmployeeSalesCommission.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            salesCommissionId: new mongoose.Types.ObjectId(salesCommissionId)
        });

        if (!myCommission) {
            return res.status(404).json({ message: "No assigned sales commission found for this employee." });
        }

        let salesProof = [];
        if (req.file) {
            console.log("Uploading file to Cloudinary...");
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "sales_proof" });
            salesProof.push({ url: result.secure_url, uploadedAt: new Date() });
            console.log("File Uploaded:", result.secure_url);
        }

        const newSalesHistory = new SalesHistory({
            userId: new mongoose.Types.ObjectId(userId),
            salesCommissionId: new mongoose.Types.ObjectId(salesCommissionId),
            salesAmount: Number(salesAmount),
            salesProof: salesProof,
            confirmationStatus: "Pending"
        });

        await newSalesHistory.save();

        return res.status(200).json({
            message: "Sales added successfully. Recorded in SalesHistory.",
            newSalesHistory
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getMySalesCommissionsStatus = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const myCommissions = await EmployeeSalesCommission.find({ userId })
            .populate("salesCommissionId", "salesCommissionName commissionRate targetAmount")
            .select("salesStatus totalSales")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your sales commissions retrieved successfully.",
            myCommissions,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getMyAddedSalesCommissions = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const myAddedSales = await SalesHistory.find({ userId })
            .populate("salesCommissionId", "salesCommissionName targetAmount commissionRate")
            .select("salesAmount salesProof confirmationStatus createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your added sales commissions retrieved successfully.",
            myAddedSales,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export { upload };
// ADMIN
export const updateConfirmationStatus = async (req, res) => {
    try {
        const { confirmationStatus } = req.body;
        const { salesHistoryId } = req.params;

        if (!["Pending", "Approved", "Rejected"].includes(confirmationStatus)) {
            return res.status(400).json({ message: "Invalid confirmationStatus. Use 'Pending', 'Approved', or 'Rejected'." });
        }

        const salesHistory = await SalesHistory.findById(salesHistoryId);
        if (!salesHistory) {
            return res.status(404).json({ message: "No sales history found for this ID." });
        }

        if (salesHistory.confirmationStatus === "Approved") {
            return res.status(400).json({ message: "Sales record is already approved." });
        }

        if (confirmationStatus === "Approved") {
            salesHistory.confirmationStatus = "Approved";

            const employeeSalesCommission = await EmployeeSalesCommission.findOne({
                userId: salesHistory.userId,
                salesCommissionId: salesHistory.salesCommissionId
            });

            if (!employeeSalesCommission) {
                return res.status(404).json({ message: "No employee sales commission record found." });
            }

            const salesCommission = await SalesCommission.findById(salesHistory.salesCommissionId);

            if (!salesCommission) {
                return res.status(404).json({ message: "Sales commission not found." });
            }

            employeeSalesCommission.totalSales += salesHistory.salesAmount;

            if (employeeSalesCommission.totalSales >= salesCommission.targetAmount) {
                employeeSalesCommission.salesStatus = "Completed";
            }

            employeeSalesCommission.earnedCommission = employeeSalesCommission.totalSales * (salesCommission.commissionRate / 100);

            await employeeSalesCommission.save();
        }

        if (confirmationStatus === "Rejected") {
            salesHistory.confirmationStatus = "Rejected";
        }

        await salesHistory.save();

        return res.status(200).json({
            message: `Sales confirmation status updated to '${confirmationStatus}'.`,
            updatedCommission: salesHistory
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

import axios from 'axios'
export const getAllAssignedSalesCommissions = async (req, res) => {
    try {
        // Fetch commissions
        const assignedCommissions = await SalesCommission.find({
            "assignedTo.assignStatus": { $in: ["Assigned", "Not Assigned"] }
        });

        // Fetch users from external API
        const serviceToken = generateServiceToken();
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; // List of users from the external API

        // Manually match users to their respective commission assignments
        const updatedAssignedCommissions = assignedCommissions.map(commission => {
            const updatedAssignedTo = commission.assignedTo.map(assignment => {
                const userId = assignment.userId?.toString();
                // Find the corresponding user from the external API response
                const user = users.find(u => u._id === userId);

                return {
                    ...assignment.toObject ? assignment.toObject() : assignment,
                    user: user 
                        ? { firstName: user.firstName, lastName: user.lastName } 
                        : { firstName: "Unassigned", lastName: "User" },  // Default if no user is found
                };
            });

            return {
                ...commission.toObject(),
                assignedTo: updatedAssignedTo,
            };
        });

        return res.status(200).json({
            message: "All assigned and not assigned sales commissions retrieved successfully.",
            assignedCommissions: updatedAssignedCommissions,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const getAllEmployeeSalesStatus = async (req, res) => {
    try {
        const employeeSalesStatus = await EmployeeSalesCommission.find()
            .populate({
                path: "userId",
                select: "firstName lastName"
            })
            .populate({
                path: "salesCommissionId",
                select: "salesCommissionName targetAmount"
            });

        return res.status(200).json({
            message: "All employee sales status retrieved successfully.",
            employeeSalesStatus,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAllAddedSalesCommissions = async (req, res) => {
    try {
        const addedSales = await SalesHistory.find()
            .populate("userId", "firstName lastName")
            .populate("salesCommissionId", "salesCommissionName targetAmount commissionRate")
            .select("salesAmount salesProof confirmationStatus createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All added sales commissions retrieved successfully.",
            addedSales,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};