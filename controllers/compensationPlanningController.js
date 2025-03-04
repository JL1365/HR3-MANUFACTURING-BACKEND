import { CompensationPlanning } from "../models/compensationPlanningModel.js";
import { StandardCompensation } from "./standardCompensationModel.js";
import { User } from "../models/userModel.js";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import axios from 'axios'

export const createCompensationPlan = async (req, res) => {
    const { position, hourlyRate, overTimeRate, holidayRate, allowances,benefits } = req.body;

    try {

        if (!Array.isArray(allowances) || !Array.isArray(benefits)) {
            return res.status(400).json({ success: false, message: "Allowances and benefits must be arrays!" });
        }
        const serviceToken = generateServiceToken();

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;

        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "No users found!" });
        }

        const userPosition = users.find(user => user.position === position);

        if (!userPosition) {
            return res.status(400).json({ success: false, message: "Position not found in Users!" });
        }
        
        const isPositionExist = await CompensationPlanning.findOne({ position: userPosition._id });
        
        if (isPositionExist) {
            return res.status(400).json({ success: false, message: "Position already exists!" });
        }
        
        const newPlan = new CompensationPlanning({
            position: userPosition._id,
            hourlyRate,
            overTimeRate,
            holidayRate,
            allowances,
            benefits
        });        

        await newPlan.save();

        res.status(201).json({ success: true, message: "Compensation created successfully!", data: newPlan });
    } catch (error) {
        console.error(`Error in creating compensation plan: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message || "An unexpected error occurred." });
    }
};

export const getCompensationPlan = async (req, res) => {
    try {
        const compensationPlans = await CompensationPlanning.find();

        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const users = response.data; 

        const positionMap = {};
        users.forEach(user => {
            positionMap[user._id] = user.position; 
        });

        const formattedPlans = compensationPlans.map(plan => ({
            ...plan._doc,
            positionName: positionMap[plan.position] || "Unknown Position"
        }));

        res.status(200).json({ success: true, data: formattedPlans });
    } catch (error) {
        console.error(`Error in getting compensation plans: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// not yet done
export const getBenefitsAndDeductions = async (req, res) => {
    try {
        // Fetch all compensation plans (only selecting benefits and deductions)
        const compensationPlans = await CompensationPlanning.find({}, "position benefits");

        // Fetch positions from the external API
        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const users = response.data;  // Assuming it returns an array of users with positions

        // Create a mapping of ObjectId -> Position Name
        const positionMap = {};
        users.forEach(user => {
            positionMap[user._id] = user.position;  // Map ObjectId to position name
        });

        // Update compensationPlans to include position names
        const filteredPlans = compensationPlans.map(plan => ({
            positionName: positionMap[plan.position] || "Unknown Position",  // Lookup position name
            benefits: plan.benefits.map(b => ({
                benefitType: b.benefitType,
                deductionsAmount: b.deductionsAmount
            }))
        }));

        res.status(200).json({ success: true, data: filteredPlans });
    } catch (error) {
        console.error(`Error in getting compensation plans: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateCompensationPlan = async (req, res) => {
    const { id } = req.params;
    const { position, hourlyRate, overTimeRate, holidayRate, allowances,benefits } = req.body;

    try {
        const compensationPlan = await CompensationPlanning.findById(id).populate("position");

        if (!compensationPlan) {
            return res.status(404).json({ success: false, message: "Compensation plan not found." });
        }

        if (position) {
            const userPosition = await User.findOne({ position });

            if (!userPosition) {
                return res.status(400).json({ success: false, message: "Position not found in Users!" });
            }

            const isPositionExist = await CompensationPlanning.findOne({ position: userPosition._id });
            if (isPositionExist && isPositionExist._id.toString() !== compensationPlan._id.toString()) {
                return res.status(400).json({ success: false, message: "Position already exists!" });
            }

            if (userPosition._id.toString() !== compensationPlan.position.toString()) {
                compensationPlan.position = userPosition._id;
            }
        }

        let formattedAllowances = compensationPlan.allowances;
        if (allowances) {
            if (!Array.isArray(allowances)) {
                return res.status(400).json({ success: false, message: "Allowances must be an array!" });
            }

            formattedAllowances = allowances.map((allowance) => {
                if (typeof allowance !== "object" || !allowance.type || !allowance.amount) {
                    return res.status(400).json({ success: false, message: "Each allowance must have a 'type' and 'amount'." });
                }
                return { type: allowance.type, amount: allowance.amount };
            });
        }
        let formattedBenefits = compensationPlan.benefits;
        if (benefits) {
            if (!Array.isArray(benefits)) {
                return res.status(400).json({ success: false, message: "benefits must be an array!" });
            }

            formattedBenefits = benefits.map((benefit) => {
                if (typeof benefit !== "object" || !benefit.benefitType || !benefit.deductionsAmount) {
                    return res.status(400).json({ success: false, message: "Each benefit must have a 'benefitType' and 'deductionsAmount'." });
                }
                return { benefitType: benefit.benefitType, deductionsAmount: benefit.deductionsAmount };
            });
            
        }

        compensationPlan.hourlyRate = hourlyRate || compensationPlan.hourlyRate;
        compensationPlan.overTimeRate = overTimeRate || compensationPlan.overTimeRate;
        compensationPlan.holidayRate = holidayRate || compensationPlan.holidayRate;
        compensationPlan.allowances = formattedAllowances;
        compensationPlan.benefits = formattedBenefits;

        await compensationPlan.save();

        res.status(200).json({ success: true, message: "Compensation plan updated successfully!", compensationPlan });

    } catch (error) {
        console.log(`Error in updating compensation plan: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};




export const deleteCompensationPlan = async (req,res) => {
    const {id} =req.params;

    try {
        const compensationPlan = await CompensationPlanning.findByIdAndDelete(id);
        if(!compensationPlan){
            return res.status(404).json({status:false,message:"Compensation planning not found!"});
        }
        res.status(200).json({success:true,message:"Compensation plan Delete successfully!"});
    } catch (error) {
        console.log(`error in deleting compensation plans ${error}`);
        res.status(500).json({success:false,message:"Server error",error:error.message});
}}



export const createStandardCompensation = async (req, res) => {
    try {
        const { standardName, standardDescription, standardStatus } = req.body;

        if (!standardName || standardStatus === undefined) {
            return res.status(400).json({ message: "standardName and standardStatus are required." });
        }

        const newStandardCompensation = new StandardCompensation({
            standardName,
            standardDescription,
            standardStatus
        });

        await newStandardCompensation.save();
        res.status(201).json({ message: "Standard compensation created successfully!", data: newStandardCompensation });

    } catch (error) {
        res.status(500).json({ message: "Error creating standard compensation", error: error.message });
    }
};


export const getStandardCompensation = async (req,res) => {
    try {
        const standardCompensations = await StandardCompensation.find();
        res.status(200).json({success:true,data:standardCompensations});
    } catch (error) {
        console.log(`error in getting compensation plans ${error}`);
        res.status(500).json({success:false,message:"Server error",error:error.message});
    }
};


export const updateStandardCompensation = async (req, res) => {
    try {
        const { id } = req.params;
        const { standardName, standardDescription, standardStatus } = req.body;

        const updatedCompensation = await StandardCompensation.findByIdAndUpdate(
            id,
            { standardName, standardDescription, standardStatus },
            { new: true, runValidators: true }
        );

        if (!updatedCompensation) {
            return res.status(404).json({ message: "Standard compensation not found." });
        }

        res.status(200).json({ message: "Standard compensation updated successfully!", data: updatedCompensation });

    } catch (error) {
        res.status(500).json({ message: "Error updating standard compensation", error: error.message });
    }
};

export const deleteStandardCompensation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCompensation = await StandardCompensation.findByIdAndDelete(id);

        if (!deletedCompensation) {
            return res.status(404).json({ success: false, message: "Standard compensation not found." });
        }

        res.status(200).json({ success: true, message: "Standard compensation deleted successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting standard compensation", error: error.message });
    }
};

