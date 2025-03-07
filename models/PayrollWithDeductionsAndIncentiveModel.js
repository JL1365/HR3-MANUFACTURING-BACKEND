import mongoose from "mongoose";

const PayrollWithDeductionsSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    employee_firstname: { type: String, required: true },
    employee_lastname: { type: String, required: true },
    position: { type: String, required: true },
    totalWorkHours: { type: Number, required: true },
    totalOvertimeHours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    overtimeRate: { type: Number, required: true },
    holidayRate: { type: Number, required: true },
    salary: { type: Number, required: true },
    benefitsDeductionsAmount: { type: Number, required: true, default: 0 },
    incentiveAmount: { type: Number, required: true, default: 0 },
    adjustedSalary: { type: Number, required: true }
}, { timestamps: true });

const PayrollWithDeductions = mongoose.model("PayrollWithDeductions", PayrollWithDeductionsSchema);
export default PayrollWithDeductions;
