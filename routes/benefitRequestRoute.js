import express from 'express'
import { applyBenefit, getAllAppliedRequest, getMyApplyRequests, updateApplyRequestStatus, upload } from '../controllers/benefitRequestController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitRequestRoute = express.Router();

benefitRequestRoute.post("/apply-benefit",verifyToken,upload.fields([{ name: "frontId" }, { name: "backId" }]),applyBenefit);
benefitRequestRoute.get("/get-my-apply-requests",verifyToken,getMyApplyRequests);
benefitRequestRoute.get("/get-all-applied-requests",verifyToken,getAllAppliedRequest);
benefitRequestRoute.put("/update-apply-request-status/:id",verifyToken,updateApplyRequestStatus);

export default benefitRequestRoute;