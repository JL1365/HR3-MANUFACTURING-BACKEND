import express from 'express'
import { createBenefit, getAllBenefits } from '../controllers/benefitController.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);
benefitRoute.get("/get-all-benefits",getAllBenefits);

export default benefitRoute;