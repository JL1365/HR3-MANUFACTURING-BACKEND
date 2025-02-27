import express from 'express'
import { createBenefit, deleteBenefit, getAllBenefits, getAllEmployeeBenefitDetails, updateBenefit } from '../controllers/benefitController.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);
benefitRoute.get("/get-all-benefits",getAllBenefits);
benefitRoute.put("/update-benefit/:id",updateBenefit);
benefitRoute.delete("/delete-benefit/:id",deleteBenefit);

benefitRoute.get("/get-all-employees-benefit-details",getAllEmployeeBenefitDetails);

export default benefitRoute;