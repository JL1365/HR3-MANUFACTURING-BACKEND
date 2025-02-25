import express from 'express'
import { getAllSalaryDistributionRequests, 
    getMySalaryDistributionRequests, 
    requestSalaryDistribution, 
    reviewSalaryDistributionRequest, 
    toggleRequestAvailability
} from '../controllers/salaryRequestController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const salaryRequestRoute = express.Router();

salaryRequestRoute.post("/request-salary-distribution",verifyToken,requestSalaryDistribution);
salaryRequestRoute.get("/get-my-salary-distribution-requests",verifyToken,getMySalaryDistributionRequests);

salaryRequestRoute.get("/get-all-salary-distribution-requests",verifyToken,getAllSalaryDistributionRequests);
salaryRequestRoute.put("/review-salary-distribution-request/:requestId",verifyToken,reviewSalaryDistributionRequest);

salaryRequestRoute.put("/toggle-request-availability",verifyToken,toggleRequestAvailability);

export default salaryRequestRoute