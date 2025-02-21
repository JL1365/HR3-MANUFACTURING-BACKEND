import express from 'express'
import { addUserDeduction, getMyDeduction } from '../controllers/benefitDeductionController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",verifyToken,addUserDeduction)
benefitDeductionRoute.get("/get-my-deductions",verifyToken,getMyDeduction)

export default benefitDeductionRoute;