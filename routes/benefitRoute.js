import express from 'express'
import { createBenefit } from '../controllers/benefitController.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);

export default benefitRoute;