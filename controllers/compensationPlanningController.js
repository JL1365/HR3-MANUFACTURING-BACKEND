import { CompensationPlanning } from "../models/compensationPlanningModel.js";
import { StandardCompensation } from "./standardCompensationModel.js";
import { User } from "../models/userModel.js";


export const createCompensationPlan = async (req, res) => {
    const { position, hourlyRate, overTimeRate, holidayRate, allowances } = req.body;

    try {
        const userPosition = await User.findOne({ position });

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
            allowances
        });

        await newPlan.save();

        res.status(201).json({ success: true, message: "Compensation created successfully!", data: newPlan });
    } catch (error) {
        console.error(`Error in creating compensation plan: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message || "An unexpected error occurred." });
    }
};


export const getCompensationPlan = async (req,res) => {
    try {
        const compensationPlans = await CompensationPlanning.find()
        .populate("position","position")
        res.status(200).json({success:true,data:compensationPlans});
    } catch (error) {
        console.log(`error in getting compensation plans ${error}`);
        res.status(500).json({success:false,message:"Server error",error:error.message});
    }
};

export const updateCompensationPlan = async (req, res) => {
    const { id } = req.params;
    const { position, hourlyRate, overTimeRate, holidayRate, allowances } = req.body;

    try {
        const compensationPlan = await CompensationPlanning.findById(id).populate("position");

        if (!compensationPlan) {
            return res.status(404).json({ success: false, message: "Compensation plan not found." });
        }

        // Only update position if provided and it differs from the current one
        if (position) {
            const userPosition = await User.findOne({ position });

            if (!userPosition) {
                return res.status(400).json({ success: false, message: "Position not found in Users!" });
            }

            // Check if the position already exists in another compensation plan
            const isPositionExist = await CompensationPlanning.findOne({ position: userPosition._id });
            if (isPositionExist && isPositionExist._id.toString() !== compensationPlan._id.toString()) {
                return res.status(400).json({ success: false, message: "Position already exists!" });
            }

            // Update position only if it's different from the current one
            if (userPosition._id.toString() !== compensationPlan.position.toString()) {
                compensationPlan.position = userPosition._id;
            }
        }

        // Handle allowances (same logic as in create)
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

        // Update the other fields if provided
        compensationPlan.hourlyRate = hourlyRate || compensationPlan.hourlyRate;
        compensationPlan.overTimeRate = overTimeRate || compensationPlan.overTimeRate;
        compensationPlan.holidayRate = holidayRate || compensationPlan.holidayRate;
        compensationPlan.allowances = formattedAllowances;

        // Save the updated compensation plan
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

