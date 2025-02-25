import express from 'express'
import { createSalesCommission, deleteSalesCommission, getAllSalesCommission, updateSalesCommission } from '../controllers/salesCommissionController.js';

const salesCommissionRoute = express.Router();

salesCommissionRoute.post("/create-sales-commission",createSalesCommission);
salesCommissionRoute.get("/get-all-sales-commission",getAllSalesCommission);
salesCommissionRoute.put("/update-sales-commission/:id",updateSalesCommission);
salesCommissionRoute.delete("/delete-sales-commission/:id",deleteSalesCommission);

export default salesCommissionRoute;