import express from "express";
import { createCompensationPlan, createStandardCompensation, deleteCompensationPlan, deleteStandardCompensation, getBenefitsAndDeductions, getCompensationPlan, getStandardCompensation, updateCompensationPlan, updateStandardCompensation } from "../controllers/compensationPlanningController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const compensationRoute = express.Router();


compensationRoute.post("/create-compensation-plan",verifyToken,createCompensationPlan);
compensationRoute.get("/get-compensation-plans",getCompensationPlan);
compensationRoute.get("/get-benefits-and-deductions",getBenefitsAndDeductions);
compensationRoute.put("/update-compensation-plan/:id",verifyToken,updateCompensationPlan);
compensationRoute.delete("/delete-compensation-plan/:id",verifyToken,deleteCompensationPlan);


compensationRoute.post("/create-standard-compensation",verifyToken,createStandardCompensation);
compensationRoute.get("/get-standard-compensations",verifyToken,getStandardCompensation);
compensationRoute.put("/update-standard-compensation/:id",verifyToken,updateStandardCompensation);
compensationRoute.delete("/delete-standard-compensation/:id",verifyToken,deleteStandardCompensation);


export default compensationRoute