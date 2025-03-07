import mongoose from "mongoose";

const PayrollHistorySchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employee_firstname: { type: String, required: true },
    employee_lastname: { type: String, required: true },
    position: { type: String, required: true },
    totalWorkHours: { type: Number, required: true },
    totalOvertimeHours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    overtimeRate: { type: Number, required: true },
    holidayRate: { type: Number, required: true },
    salary: { type: Number, required: true },
    benefitsDeductionsAmount: { type: Number, default: 0 },
    incentiveAmount: { type: Number, default: 0 },
    adjustedSalary: { type: Number, required: true },
    payroll_date: { type: Date, default: Date.now } // Para may tracking kung kailan ito na-finalize
});

const PayrollHistory = mongoose.model("PayrollHistory", PayrollHistorySchema);

export default PayrollHistory;
