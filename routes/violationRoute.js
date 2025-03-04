import express from "express";
import { createViolation, deleteViolation, getMyViolations, getEmployeeViolations, updateViolationStatus } from "../controllers/violationController.js";
import { serviceVerifyToken, verifyToken } from "../middleware/verifyToken.js";

const violationRoute = express.Router();

violationRoute.post("/create-penalty-violation",verifyToken, createViolation);
violationRoute.get("/get-all-employee-violations",serviceVerifyToken, getEmployeeViolations);
violationRoute.put("/update-violation-status/:id",verifyToken, updateViolationStatus);
violationRoute.delete("/delete-violation/:id",verifyToken, deleteViolation);
violationRoute.get("/get-my-violations",verifyToken, getMyViolations);

export default violationRoute;
