import express from 'express'
import { createIncentive, deleteIncentive, getAllIncentives, updateIncentive } from '../controllers/incentiveController.js';

const incentiveRoute = express.Router();

incentiveRoute.post("/create-incentive",createIncentive);
incentiveRoute.get("/get-all-incentives",getAllIncentives);
incentiveRoute.put("/update-incentive/:id",updateIncentive);
incentiveRoute.delete("/delete-incentive/:id",deleteIncentive);

export default incentiveRoute;