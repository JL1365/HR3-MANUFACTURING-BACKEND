import express from 'express'
import { createIncentive, deleteIncentive, getAllEmployeeIncentiveDetails, getAllIncentives, updateIncentive } from '../controllers/incentiveController.js';
import { serviceVerifyToken } from '../middleware/verifyToken.js';

const incentiveRoute = express.Router();

incentiveRoute.post("/create-incentive",createIncentive);
incentiveRoute.get("/get-all-incentives",getAllIncentives);
incentiveRoute.put("/update-incentive/:id",updateIncentive);
incentiveRoute.delete("/delete-incentive/:id",deleteIncentive);

incentiveRoute.get("/get-all-employee-incentive-details",serviceVerifyToken,getAllEmployeeIncentiveDetails);

export default incentiveRoute;