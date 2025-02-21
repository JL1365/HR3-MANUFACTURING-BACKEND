import express from 'express'
import { addUserDeduction } from '../controllers/benefitDeductionController.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",addUserDeduction)

export default benefitDeductionRoute;