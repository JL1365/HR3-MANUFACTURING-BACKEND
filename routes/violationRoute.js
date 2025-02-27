import express from "express";
import { createViolation, deleteViolation, getViolations, updateViolationStatus } from "../controllers/violationController.js";

const violationRoute = express.Router();

violationRoute.post("/create-penalty-violation", createViolation);
violationRoute.get("/get-all-violations", getViolations);
violationRoute.put("/update-violation-status/:id", updateViolationStatus);
violationRoute.delete("/delete-violation/:id", deleteViolation);

export default violationRoute;
