import express from 'express'
import { createBenefit, deleteBenefit, getAllBenefits, updateBenefit } from '../controllers/benefitController.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);
benefitRoute.get("/get-all-benefits",getAllBenefits);
benefitRoute.put("/update-benefit/:id",updateBenefit);
benefitRoute.delete("/delete-benefit/:id",deleteBenefit);

export default benefitRoute;