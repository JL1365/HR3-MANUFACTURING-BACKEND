import express from "express";
import {
  createPenaltyLevel,
  getPenaltyLevels,
  updatePenaltyLevel,
  deletePenaltyLevel,
} from "../controllers/penaltyController.js";

const penaltyRoute = express.Router();

penaltyRoute.post("/create-penalty-level", createPenaltyLevel);
penaltyRoute.get("/get-all-penalties", getPenaltyLevels);
penaltyRoute.put("/update-penalty/:id", updatePenaltyLevel);
penaltyRoute.delete("/delete-penalty/:id", deletePenaltyLevel);

export default penaltyRoute;
