import express from 'express'
import { calculatePayroll, finalizePayroll, getAllSalaryDistributionRequests, 
    getMySalaryDistributionRequests, 
    getPayrollWithDeductionsAndIncentives, 
    // manualResetPayroll, 
    requestSalaryDistribution, 
    reviewSalaryDistributionRequest, 
    toggleRequestAvailability
} from '../controllers/salaryRequestController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const salaryRequestRoute = express.Router();

salaryRequestRoute.get("/calculate-payroll", calculatePayroll);
salaryRequestRoute.get("/get-payroll-with-deductions", getPayrollWithDeductionsAndIncentives);
// salaryRequestRoute.post("/manual-reset", manualResetPayroll);
salaryRequestRoute.post("/finalize-payroll", finalizePayroll);

salaryRequestRoute.post("/request-salary-distribution",verifyToken,requestSalaryDistribution);
salaryRequestRoute.get("/get-my-salary-distribution-requests",verifyToken,getMySalaryDistributionRequests);

salaryRequestRoute.get("/get-all-salary-distribution-requests",verifyToken,getAllSalaryDistributionRequests);
salaryRequestRoute.put("/review-salary-distribution-request/:requestId",verifyToken,reviewSalaryDistributionRequest);

salaryRequestRoute.put("/toggle-request-availability",verifyToken,toggleRequestAvailability);

export default salaryRequestRoute