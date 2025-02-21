import express from 'express'
import { applyBenefit, getMyApplyRequests, upload } from '../controllers/benefitRequestController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitRequestRoute = express.Router();

benefitRequestRoute.post("/apply-benefit",verifyToken,upload.fields([{ name: "frontId" }, { name: "backId" }]),applyBenefit);
benefitRequestRoute.get("/get-my-apply-requests",verifyToken,getMyApplyRequests);

export default benefitRequestRoute;