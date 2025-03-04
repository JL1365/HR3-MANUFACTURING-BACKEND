import express from 'express'
import { createBenefit, deleteBenefit, getAllBenefits, getAllEmployeeBenefitDetails, updateBenefit, uploadDocument, getUploadedDocuments } from '../controllers/benefitController.js';
import upload from '../config/multerConfig.js';
import { serviceVerifyToken, verifyToken } from '../middleware/verifyToken.js';

const benefitRoute = express.Router();

benefitRoute.post("/create-benefit",createBenefit);
benefitRoute.get("/get-all-benefits",getAllBenefits);
benefitRoute.put("/update-benefit/:id",updateBenefit);
benefitRoute.delete("/delete-benefit/:id",deleteBenefit);

benefitRoute.get("/get-all-employees-benefit-details",getAllEmployeeBenefitDetails);
benefitRoute.post("/send-benefit-documents",upload.single('documentFile'),uploadDocument);
benefitRoute.get("/get-uploaded-documents", getUploadedDocuments);

export default benefitRoute;