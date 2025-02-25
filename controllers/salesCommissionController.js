import { SalesCommission } from "../models/salesCommissionModel.js";

export const createSalesCommission = async (req, res) => {
    try {
        const { salesCommissionName, targetAmount, commissionRate, status } = req.body;
        
        if (!salesCommissionName || !targetAmount || !commissionRate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newCommission = new SalesCommission({
            salesCommissionName,
            targetAmount,
            commissionRate,
            status: status || "Not Available"
        });

        await newCommission.save();
        return res.status(201).json({ message: "Sales Commission created successfully.", commission: newCommission });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAllSalesCommission = async (req, res) => {
    try {
        const allSalesCommissions = await SalesCommission.find({})
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

