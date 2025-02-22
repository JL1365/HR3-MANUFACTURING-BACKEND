import express from "express";
import { createIncentiveTracking, deleteIncentiveTracking, getAllIncentiveTracking, getMyIncentiveTracking, updateIncentiveTracking } from "../controllers/incentiveTrackingController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const incentiveTrackingRoute = express.Router();

incentiveTrackingRoute.post("/create-incentive-tracking",verifyToken, createIncentiveTracking);
incentiveTrackingRoute.get("/get-all-incentive-tracking",verifyToken, getAllIncentiveTracking);
incentiveTrackingRoute.get("/get-my-incentives-tracking",verifyToken, getMyIncentiveTracking);
incentiveTrackingRoute.put("/update-incentive-tracking/:id", updateIncentiveTracking);
incentiveTrackingRoute.delete("/delete-incentive-tracking/:id", deleteIncentiveTracking);

export default incentiveTrackingRoute;
