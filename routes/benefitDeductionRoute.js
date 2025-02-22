import express from 'express'
import { addUserDeduction, getAllBenefitDeductions, getMyDeduction, updateUserDeduction } from '../controllers/benefitDeductionController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",verifyToken,addUserDeduction)
benefitDeductionRoute.get("/get-my-deductions",verifyToken,getMyDeduction)
benefitDeductionRoute.get("/get-all-deductions",verifyToken,getAllBenefitDeductions)
benefitDeductionRoute.put("/update-user-deduction/:id",verifyToken,updateUserDeduction)

export default benefitDeductionRoute;