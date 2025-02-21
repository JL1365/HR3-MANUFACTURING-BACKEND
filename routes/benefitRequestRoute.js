import express from 'express'
import { applyBenefit, upload } from '../controllers/benefitRequestController.js';

const benefitRequestRoute = express.Router();

benefitRequestRoute.post("/apply-benefit",upload.fields([{ name: "frontId" }, { name: "backId" }]),applyBenefit);

export default benefitRequestRoute;