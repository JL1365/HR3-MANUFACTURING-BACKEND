import express from 'express'
import { addMySalesCommission, 
    assignSalesCommission, 
    createSalesCommission, 
    deleteSalesCommission, 
    getAllAddedSalesCommissions, 
    getAllAssignedSalesCommissions, 
    getAllEmployeeSalesStatus, 
    getAllSalesCommission, 
    getMyAddedSalesCommissions, 
    getMyAssignedSalesCommissions, 
    getMySalesCommissionsStatus, 
    updateConfirmationStatus, 
    updateSalesCommission, 
    upload
} from '../controllers/salesCommissionController.js';

import { verifyToken } from '../middleware/verifyToken.js';

const salesCommissionRoute = express.Router();

salesCommissionRoute.post("/create-sales-commission",createSalesCommission);
salesCommissionRoute.get("/get-all-sales-commission",getAllSalesCommission);
salesCommissionRoute.put("/update-sales-commission/:id",updateSalesCommission);
salesCommissionRoute.delete("/delete-sales-commission/:id",deleteSalesCommission);

//Admin side
salesCommissionRoute.put("/update-confirmation-status/:salesHistoryId", verifyToken, updateConfirmationStatus);

salesCommissionRoute.get("/get-all-assigned-sales-commission", verifyToken,getAllAssignedSalesCommissions );
salesCommissionRoute.get("/get-all-employee-sales-status", verifyToken, getAllEmployeeSalesStatus);
salesCommissionRoute.get("/get-all-added-sales-commission", verifyToken,getAllAddedSalesCommissions);

//Employee  side
salesCommissionRoute.post("/assign-sales-commission",verifyToken,assignSalesCommission);
salesCommissionRoute.post("/add-my-sales-commission", verifyToken, upload.single("salesProof"), addMySalesCommission);

salesCommissionRoute.get("/get-my-assigned-sales-commissions", verifyToken,getMyAssignedSalesCommissions );
salesCommissionRoute.get("/get-my-sales-commission-status", verifyToken, getMySalesCommissionsStatus);
salesCommissionRoute.get("/get-my-added-sales-commissions", verifyToken,getMyAddedSalesCommissions);



export default salesCommissionRoute;