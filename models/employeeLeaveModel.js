import mongoose from "mongoose";

    const employeeLeaveSchema = new mongoose.Schema({
    employee_id: { type: String, required: true, unique: true },
    employee_firstname:{type:String},
    employee_lastname:{type:String},
    leave_count: { type: Number, default: 0 }, 
    leave_types: { 
        type: Map, 
        of: Number, 
        default: {} 
    },
    leaves: [
        {
            leave_id: { type: String, required: true }, 
            leave_type: { type: String, required: true }
        }
    ] 
});

export const EmployeeLeave = mongoose.model("EmployeeLeave", employeeLeaveSchema);
