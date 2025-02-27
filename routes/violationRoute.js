import express from "express";
import { createViolation, deleteViolation, getMyViolations, getViolations, updateViolationStatus } from "../controllers/violationController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const violationRoute = express.Router();

violationRoute.post("/create-penalty-violation",verifyToken, createViolation);
violationRoute.get("/get-all-violations",verifyToken, getViolations);
violationRoute.put("/update-violation-status/:id",verifyToken, updateViolationStatus);
violationRoute.delete("/delete-violation/:id",verifyToken, deleteViolation);
violationRoute.get("/get-my-violations",verifyToken, getMyViolations);

export default violationRoute;
