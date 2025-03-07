import express from 'express'
import { applyBenefit, getAllAppliedRequest, getAppliedRequestCount, getMyApplyRequests, updateApplyRequestStatus, updateMyUploadedDocs, upload } from '../controllers/benefitRequestController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const benefitRequestRoute = express.Router();

benefitRequestRoute.post("/apply-benefit",verifyToken,upload.fields([{ name: "frontId" }, { name: "backId" }]),applyBenefit);
benefitRequestRoute.get("/get-my-apply-requests",verifyToken,getMyApplyRequests);
benefitRequestRoute.get("/get-all-applied-requests",verifyToken,getAllAppliedRequest);
benefitRequestRoute.get("/get-all-applied-requests-count",getAppliedRequestCount);
benefitRequestRoute.put("/update-apply-request-status/:id",verifyToken,updateApplyRequestStatus);
benefitRequestRoute.put('/update-uploaded-docs/:requestId', verifyToken,upload.fields([{ name: "frontId" }, { name: "backId" }]), updateMyUploadedDocs);

export default benefitRequestRoute;