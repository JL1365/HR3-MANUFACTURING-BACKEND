import { BenefitRequest } from "../models/benefitRequestModel.js";
import upload from '../config/multerConfig.js'
 
export const applyBenefit = async (req, res) => {
  try {
    const { userId, benefitId } = req.body; 

    const frontIdUrl = req.files.frontId[0].path;
    const backIdUrl = req.files.backId[0].path;

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

    res.status(201).json({
      message: "Benefit request submitted successfully",
      requestId: newRequest._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while applying for benefits",
      error: error.message,
    });
  }
};

export { upload };
