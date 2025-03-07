import  mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    employee_firstname: { type: String, required: true },
    employee_lastname: { type: String, required: true },
    position: { type: String, required: true },
    totalWorkHours: { type: Number, required: true },
    totalOvertimeHours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    overtimeRate: { type: Number, required: true },
    holidayRate: { type: Number, required: true },
    salary: { type: Number, required: true },
    generated_at: { type: Date, default: Date.now },
      isFinalized: { type: Boolean, default: false } 
});

export const Payroll = mongoose.model("Payroll",payrollSchema)