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

