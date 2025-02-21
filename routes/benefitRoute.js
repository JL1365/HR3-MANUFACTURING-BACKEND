import express from 'express'
import { createBenefit, getAllBenefits, updateBenefit } from '../controllers/benefitController.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);
benefitRoute.get("/get-all-benefits",getAllBenefits);
benefitRoute.put("/update-benefit/:id",updateBenefit);

export default benefitRoute;