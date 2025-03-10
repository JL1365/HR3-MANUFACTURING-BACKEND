import mongoose from 'mongoose';

const payrollPredictionSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employee_firstname: { type: String, required: true },
    employee_lastname: { type: String, required: true },
    predictedNetSalary: Number,
    payroll_date: { type: Date, required: true, default: Date.now },
});

const PayrollPredictionModel = mongoose.model('PayrollPrediction', payrollPredictionSchema);

export default PayrollPredictionModel;
