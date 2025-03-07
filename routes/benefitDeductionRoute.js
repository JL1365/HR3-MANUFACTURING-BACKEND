import express from 'express'
import { addUserDeduction, getAllBenefitDeductions, getMyDeduction, getTotalDeductions, updateUserDeduction } from '../controllers/benefitDeductionController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",verifyToken,addUserDeduction)
benefitDeductionRoute.get("/get-my-deductions",verifyToken,getMyDeduction)
benefitDeductionRoute.get("/get-all-deductions",getAllBenefitDeductions)
benefitDeductionRoute.get("/get-total-deductions",getTotalDeductions)
benefitDeductionRoute.put("/update-user-deduction/:id",verifyToken,updateUserDeduction)

export default benefitDeductionRoute;