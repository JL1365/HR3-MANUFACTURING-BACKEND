import express from 'express';
import PayrollHistory from '../models/PayrollHistory.js';
import { predictSalaries } from '../controllers/payrollController.js';
import PayrollPredictionModel from '../models/payrollPredictionModel.js';

const payrollroute = express.Router();

payrollroute.get("/predict-salaries", async (req, res) => {
    try {
        const predictions = await predictSalaries();
        res.json({ success: true, predictions });
    } catch (error) {
        console.error("Error in prediction:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

payrollroute.get("/get-payroll-predictions", async (req, res) => {
    try {
        const payrollHistories = await PayrollHistory.find({}).sort({ payroll_date: 1 });
        
        const predictions = await PayrollPredictionModel.find().sort({ payroll_date: 1 });

        res.json({success: true,predictions,payrollHistories,});
    } catch (error) {
        console.error("Error fetching payroll data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default payrollroute;
