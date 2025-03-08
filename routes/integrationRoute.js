import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ComplaintUser } from '../models/hr4/complaintUserModel.js';
import { getBudgetRequests, receiveGrievance, requestBudget, updateBudgetRequest } from '../controllers/integrationController.js';
import upload from '../config/multerConfig.js';
import { serviceVerifyToken, verifyToken } from '../middleware/verifyToken.js';
import { generateServiceToken } from '../middleware/gatewayTokenGenerator.js';


const integrationRoute = express.Router();

integrationRoute.post("/send-benefits-document", async (req, res) => {
    try {
        const { documentName, documentType, description } = req.body;

        if (!documentName || !documentType ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const token = generateServiceToken();
        const response = await axios.post(`${process.env.API_GATEWAY_URL}/admin/document-management`, 
            { documentName, documentType, description },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return res.status(200).json({ message: "Document sent successfully", data: response.data });
    } catch (error) {
        console.error('Error sending document:', error.response?.data || error.message);
        return res.status(500).json({ message: "Failed to send document", error: error.message });
    }
});

// integrationRoute.get("/get-all-attendance", async (req, res) => {
//     try {
//         const token = generateServiceToken();
//         console.log("Generated Token:", token);

//         if (!token) {
//             return res.status(401).json({ message: "Failed to generate service token" });
//         }

//         if (!process.env.HR1_URL) {
//             return res.status(500).json({ message: "API Gateway URL is not configured" });
//         }

//         const response = await axios.get(`${process.env.HR1_URL}/api/timetrack/approveSessions`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         return res.status(200).json(response.data);
//     } catch (error) {
//         console.error("Something went wrong:", error?.response?.data || error.message);
//         return res.status(error?.response?.status || 500).json({
//             message: "Failed to fetch attendance data",
//             error: error?.response?.data || error.message,
//         });
//     }
// });

import cron from 'node-cron';
import Attendance from '../models/attendanceModel.js';
import Batch from '../models/batchModel.js';

async function generateBatchId() {
  const now = new Date();

 
  const activeBatch = await Batch.findOne({
    expiration_date: { $gte: now }, 
  });

  if (activeBatch) {
   
    return activeBatch.batch_id;
  } else {
   
    const newBatchId = `batch-${now.getTime()}`;


    const expirationDate = new Date(now);
    expirationDate.setDate(now.getDate() + 15);

    const newBatch = new Batch({
      batch_id: newBatchId,
      expiration_date: expirationDate,
    });

    await newBatch.save(); 
    return newBatchId; 
  }
}

cron.schedule('0 0 1,16 * *', async () => {  
  try {
    console.log('Cron job triggered: Checking expired batches and generating new batch');

    const latestBatch = await Batch.findOne().sort({ created_at: -1 });

    if (latestBatch) {
      console.log(`Deleting the latest batch with ID: ${latestBatch.batch_id}`);
      const deleteResult = await Batch.deleteOne({ _id: latestBatch._id });

      if (deleteResult.deletedCount === 0) {
        console.log(`Failed to delete the batch with ID: ${latestBatch.batch_id}`);
      } else {
        console.log(`Successfully deleted the batch with ID: ${latestBatch.batch_id}`);
      }
    } else {
      console.log("No batches found.");
    }

    const newBatchId = `batch-${Date.now()}`;
    console.log(`New batch ID generated: ${newBatchId}`);

    const newBatch = new Batch({
      batch_id: newBatchId,
      expiration_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    await newBatch.save();
    console.log(`New batch created with ID: ${newBatchId}`);

    const attendanceData = await Attendance.find({ batch_id: null });
    for (const record of attendanceData) {
      record.batch_id = newBatchId;
      await record.save();
      console.log(`Updated attendance for employee ${record.employee_id} with batch ID ${newBatchId}`);
    }

    console.log('Attendance data processed and batch ID assigned.');

  } catch (err) {
    console.error("Error during cron job execution:", err);
  }
});

integrationRoute.post("/trigger-cron", async (req, res) => {
  try {
    console.log('Manual trigger: Cron job started');

    // Trigger the same functionality as the cron job
    const serviceToken = generateServiceToken();

    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/hr1/get-time-tracking`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    console.log("Fetched data:", response.data);

    const attendanceData = response.data;

    // Find the latest batch and delete it regardless of expiration status
    const latestBatch = await Batch.findOne().sort({ created_at: -1 });  // Sort by created_at descending to get the latest batch

    if (!latestBatch) {
      console.log("No batches found.");
      return res.status(404).json({ message: 'No batch records found' });
    }

    // Log the current expiration date and the batch ID that will be deleted
    console.log(`Deleting the latest batch with ID: ${latestBatch.batch_id}`);

    // Delete the latest batch
    const deleteResult = await Batch.deleteOne({ _id: latestBatch._id });

    if (deleteResult.deletedCount === 0) {
      console.log(`Failed to delete the batch with ID: ${latestBatch.batch_id}`);
    } else {
      console.log(`Successfully deleted the batch with ID: ${latestBatch.batch_id}`);
    }

    // **Generate a new batch ID for future use**
    const newBatchId = `batch-${Date.now()}`;  // Generate a new batch ID based on the current timestamp
    console.log(`New batch ID generated: ${newBatchId}`);

    // **Create a new batch record**
    const newBatch = new Batch({
      batch_id: newBatchId,  // Assign new batch ID
      expiration_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),  // Set new expiration (e.g., 15 days later)
    });

    await newBatch.save();  // Save the new batch record
    console.log(`New batch created with ID: ${newBatchId}`);

    // Proceed with attendance processing, using the newly created batch ID
    for (const record of attendanceData) {
      const existingAttendance = await Attendance.findOne({ _id: record._id });

      if (existingAttendance) {
        console.log(`Attendance with _id ${record._id} already exists, skipping.`);
        continue;
      }

      // Use the new batch ID
      const batchId = newBatch.batch_id;

      const attendance = new Attendance({
        _id: record._id,
        employee_id: record.employee_id,
        employee_firstname: record.employee_firstname,
        employee_lastname: record.employee_lastname,
        position: record.position,
        time_in: record.time_in,
        time_out: record.time_out,
        total_hours: record.total_hours,
        overtime_hours: record.overtime_hours,
        status: record.status,
        remarks: record.remarks,
        purpose: record.purpose,
        entry_type: record.entry_type,
        approved_by: record.approved_by,
        approved_at: record.approved_at,
        entry_status: record.entry_status,
        minutes_late: record.minutes_late,
        batch_id: batchId,  // Assign the new batch ID
      });

      await attendance.save();  // Save the record to the database
      console.log(`Saved attendance for employee ${record.employee_id} with _id ${record._id}`);
    }

    res.status(200).json({ message: 'Attendance data processed successfully via manual trigger' });
  } catch (err) {
    console.error("Error processing attendance data:", err);
    res.status(500).json({ message: 'Error processing attendance data', error: err.message });
  }
});

integrationRoute.get("/get-all-attendance-data", async (req, res) => {
  try {
    const serviceToken = generateServiceToken();

    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/hr1/get-time-tracking`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    console.log("Fetched data:", response.data);

    const attendanceData = response.data;

    for (const record of attendanceData) {
      const existingAttendance = await Attendance.findOne({
        _id: record._id,
      });

      if (existingAttendance) {
        console.log(`Attendance with _id ${record._id} already exists, skipping.`);
        continue;
      }

    // Update the batchId generation logic to wait for the Promise to resolve
const batchId = await generateBatchId();  // Ensure it resolves before using it

const attendance = new Attendance({
  _id: record._id,
  employee_id: record.employee_id,
  employee_firstname: record.employee_firstname,
  employee_lastname: record.employee_lastname,
  position: record.position,
  time_in: record.time_in,
  time_out: record.time_out,
  total_hours: record.total_hours,
  overtime_hours: record.overtime_hours,
  status: record.status,
  remarks: record.remarks,
  purpose: record.purpose,
  entry_type: record.entry_type,
  approved_by: record.approved_by,
  approved_at: record.approved_at,
  entry_status: record.entry_status,
  minutes_late: record.minutes_late,
  batch_id: batchId,  // Now batch_id will be a string, not a Promise
});

await attendance.save();  // Save the record to the database
console.log(`Saved attendance for employee ${record.employee_id} with _id ${record._id}`);

    }

    res.status(200).json({ message: "Attendance data saved successfully" });
  } catch (err) {
    console.error("Error fetching and saving data:", err);
    res.status(500).json({ message: "Server error" });
  }
});



integrationRoute.get("/get-attendance-data", async (req, res) => {
  try {
    // Fetch all attendance records
    const attendance = await Attendance.find();

    // Respond with the fetched attendance data
    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    console.error("Error fetching attendance data:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


integrationRoute.get("/get-all-approved-leaves", async (req, res) => {
    try {
      const serviceToken = generateServiceToken();
  
      const response = await axios.get(
        `${process.env.API_GATEWAY_URL}/hr1/get-approved-leaves`,
        {
            headers: { Authorization: `Bearer ${serviceToken}` },

        }
      );
  
      console.log("Fetched data:", response.data);
  
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: "Server error" });
    }
});

const formatDate = (isoString) => isoString.split("T")[0];

// Function to convert "Xh Ym" format to total minutes
const parseTimeString = (timeString) => {
    const matches = timeString.match(/(\d+)h\s*(\d*)m?/);
    if (!matches) return 0;
    const hours = parseInt(matches[1], 10) || 0;
    const minutes = parseInt(matches[2], 10) || 0;
    return hours * 60 + minutes;
};

// Function to convert total minutes back to "Xh Ym"
const formatTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

// Route to get attendance summary
integrationRoute.get("/get-attendance-summary", async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        // Fetch attendance records
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/hr1/get-time-tracking`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const attendanceRecords = response.data;

        if (!Array.isArray(attendanceRecords)) {
            return res.status(500).json({ message: "Invalid data format from API" });
        }

        const employeeAttendance = {};

        attendanceRecords.forEach((record) => {
            const { employee_id, employee_firstname, employee_lastname, position, time_in, total_hours } = record;
            const date = formatDate(time_in);
            const totalMinutes = parseTimeString(total_hours);

            if (!employeeAttendance[employee_id]) {
                employeeAttendance[employee_id] = {
                    employee_id,
                    employee_name: `${employee_firstname} ${employee_lastname}`,
                    position,
                    earliest_date: date,
                    latest_date: date,
                    total_minutes: 0,
                    time_in_count: 0,
                };
            }

            employeeAttendance[employee_id].total_minutes += totalMinutes;
            employeeAttendance[employee_id].time_in_count += 1;

            if (date < employeeAttendance[employee_id].earliest_date) {
                employeeAttendance[employee_id].earliest_date = date;
            }
            if (date > employeeAttendance[employee_id].latest_date) {
                employeeAttendance[employee_id].latest_date = date;
            }
        });

        const result = Object.values(employeeAttendance).map((employee) => ({
            employee_id: employee.employee_id,
            employee_name: employee.employee_name,
            position: employee.position,
            date_range: `${employee.earliest_date} to ${employee.latest_date}`,
            total_hours: formatTimeString(employee.total_minutes),
            time_in_count: employee.time_in_count,
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching attendance data:", err);
        res.status(500).json({ message: "Server error" });
    }
});


integrationRoute.post("/request-budgetsssss", async (req, res) => {
    try {
        const token = generateServiceToken();
        const { department, typeOfRequest, category, reason, totalRequest, documents } = req.body;

        const requestBody = {
            requestId: `REQ-${Date.now()}`,
            department,
            typeOfRequest,
            category,
            reason,
            totalRequest,
            documents,
            status: "Pending",  
            comment: ""
        };

        const response = await axios.post(`${process.env.API_GATEWAY_URL}/API/BudgetRequests/RequestBudget`, requestBody, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.status(201).json({ message: "Budget request sent to Finance", data: response.data });
    } catch (error) {
        console.error("Error sending budget request:", error.response?.data || error.message);
        return res.status(500).json({ message: "Failed to send budget request", error: error.message });
    }
});
integrationRoute.post("/request-budget" ,upload.single("documents"), requestBudget);
integrationRoute.post("/updateStatusFinance", updateBudgetRequest);
integrationRoute.get("/get-request-budget", getBudgetRequests);


integrationRoute.post("/receive-grievance" ,upload.single("file"), receiveGrievance);
/* integrationRoute.post("/receive-grievance", async (req, res) => {
    try {
        // const { userId, firstName, lastName, complaintDescription, file, status } = req.body;
        const { fullName, complaintDescription, file, status } = req.body;

        // if (!userId || !firstName || !lastName || !complaintDescription) {
        //     return res.status(400).json({ message: "Missing required fields" });
        // }
        if (!fullName || !complaintDescription) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const complaint = new ComplaintUser({
            // userId,
            // firstName,
            // lastName,
            fullName,
            complaintDescription,
            file,
            status,
            punishment: "", 
        });

        await complaint.save();

        return res.status(201).json({ message: "Grievance received", data: complaint });
    } catch (error) {
        console.error("Error receiving grievance:", error.message);
        return res.status(500).json({ message: "Failed to receive grievance", error: error.message });
    }
}); */

integrationRoute.get("/get-all-grievances", async (req, res) => {
    try {
        const grievances = await ComplaintUser.find();
        return res.status(200).json({ grievances });
    } catch (error) {
        console.error("Error fetching grievances:", error.message);
        return res.status(500).json({ message: "Failed to fetch grievances", error: error.message });
    }
});

integrationRoute.get("/get-budget-request/:requestId", async (req, res) => {
    try {
        const token = generateServiceToken();
        const { requestId } = req.params;

        const response = await axios.get(`${process.env.API_GATEWAY_URL}/finance/get-budget-request/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching budget request:", error.response?.data || error.message);
        return res.status(500).json({ message: "Failed to fetch budget request", error: error.message });
    }
});

integrationRoute.get("/get-all-grievance", async (req, res) => {
    try {
      const serviceToken = generateServiceToken();
  
      const response = await axios.get(
        `${process.env.API_GATEWAY_URL}/hr4/EmComplaint`,
        {
            headers: { Authorization: `Bearer ${serviceToken}` },

        }
      );
  
      console.log("Fetched data:", response.data);
  
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: "Server error" });
    }
});
export default integrationRoute;
