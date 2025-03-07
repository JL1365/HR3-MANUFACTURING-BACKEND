import mongoose from 'mongoose';

// Define the Attendance schema
const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employee_firstname: {
    type: String,
    required: true,
  },
  employee_lastname: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  time_in: {
    type: Date,
    required: true,
  },
  time_out: {
    type: Date,
    required: true,
  },
  total_hours: {
    type: String,
    required: true,
  },
  overtime_hours: {
    type: String,
    default: '0h 0m',
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending',
  },
  remarks: {
    type: String,
    default: '',
  },
  purpose: {
    type: String,
    default: '',
  },
  entry_type: {
    type: String,
    enum: ['Manual Entry', 'System Entry'],
    required: true,
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  approved_at: {
    type: Date,
    default: null,
  },
  entry_status: {
    type: String,
    enum: ['on_time', 'late', 'early'],
    default: 'on_time',
  },
  minutes_late: {
    type: Number,
    default: 0,
  },
  batch_id: { // New field for the batch ID
    type: String,
    required: true,
  }
}, { timestamps: true }); // `timestamps` will automatically add createdAt and updatedAt fields

// Create the Attendance model
const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
