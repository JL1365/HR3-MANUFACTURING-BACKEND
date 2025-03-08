import { RequestSettings } from "../models/requestSettingModel.js";
import { SalaryRequest } from "../models/salaryRequestModel.js";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import axios from "axios";
import { CompensationPlanning } from "../models/compensationPlanningModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import {Payroll} from '../models/payrollModel.js'
import PayrollWithDeductions from "../models/PayrollWithDeductionsAndIncentiveModel.js";
import PayrollHistory from "../models/PayrollHistory.js";
import Attendance from "../models/attendanceModel.js";
import Batch from "../models/batchModel.js";

export const calculatePayroll = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        // Fetch only non-finalized attendance records
        const attendanceData = await Attendance.find({ isFinalized: { $ne: true } });

        const compensationPlans = await CompensationPlanning.find();

        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const users = response.data;
        const positionMap = {};
        users.forEach(user => {
            positionMap[user._id] = user.position;
        });

        const formattedPlans = compensationPlans.map(plan => ({
            ...plan._doc,
            positionName: positionMap[plan.position] || "Unknown Position"
        }));

        const compensationMap = {};
        formattedPlans.forEach(plan => {
            compensationMap[plan.positionName] = plan;
        });

        const defaultHourlyRate = 110;
        const defaultOvertimeRate = 75;
        const defaultHolidayRate = 30;

        const payrollByBatch = {};

        attendanceData.forEach(attendance => {
            const batchId = attendance.batch_id;
            const employeeId = attendance.employee_id.toString();
            const positionName = attendance.position || "Unknown Position";
            const compensation = compensationMap[positionName];

            const hourlyRate = compensation ? compensation.hourlyRate || defaultHourlyRate : defaultHourlyRate;
            const overtimeRate = compensation ? compensation.overTimeRate || defaultOvertimeRate : defaultOvertimeRate;
            const holidayRate = compensation ? compensation.holidayRate || defaultHolidayRate : defaultHolidayRate;

            let totalHours = 0, totalMinutes = 0;
            if (attendance.total_hours) {
                const matches = attendance.total_hours.match(/(\d+)h\s*(\d+)?/);
                totalHours = matches ? parseInt(matches[1], 10) || 0 : 0;
                totalMinutes = matches && matches[2] ? parseInt(matches[2], 10) || 0 : 0;
            }

            let overtimeHours = 0, overtimeMinutes = 0;
            if (attendance.overtime_hours) {
                const matches = attendance.overtime_hours.match(/(\d+)h\s*(\d+)?/);
                overtimeHours = matches ? parseInt(matches[1], 10) || 0 : 0;
                overtimeMinutes = matches && matches[2] ? parseInt(matches[2], 10) || 0 : 0;
            }

            const totalWorkHours = totalHours + (totalMinutes / 60);
            const totalOvertimeHours = overtimeHours + (overtimeMinutes / 60);

            
            if (!payrollByBatch[batchId]) {
                payrollByBatch[batchId] = {};
            }

            if (!payrollByBatch[batchId][employeeId]) {
                payrollByBatch[batchId][employeeId] = {
                    employee_id: attendance.employee_id,
                    employee_firstname: attendance.employee_firstname,
                    employee_lastname: attendance.employee_lastname,
                    position: positionName,
                    totalWorkHours,
                    totalOvertimeHours,
                    hourlyRate,
                    overtimeRate,
                    holidayRate
                };
            } else {
                payrollByBatch[batchId][employeeId].totalWorkHours += totalWorkHours;
                payrollByBatch[batchId][employeeId].totalOvertimeHours += totalOvertimeHours;
            }
        });

        const payrollData = Object.entries(payrollByBatch).map(([batchId, employees]) => ({
            batch_id: batchId,
            employees: Object.values(employees).map(employee => ({
                ...employee,
                salary: ((employee.totalWorkHours * employee.hourlyRate) + 
                         (employee.totalOvertimeHours * employee.overtimeRate)).toFixed(2)
            }))
        }));

        res.status(200).json({ success: true, data: payrollData });
    } catch (error) {
        console.error(`Error in calculating payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getPayrollWithDeductionsAndIncentives = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        const payrollResponse = await axios.get(
            `http://localhost:7687/api/salaryRequest/calculate-payroll`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );
        const payrollData = payrollResponse.data.data;

        const deductions = await BenefitDeduction.find({ isAlreadyAdded: false });

        const approvedIncentives = await IncentiveTracking.find({ isAlreadyAdded: false });

        const deductionsMap = {};
        deductions.forEach(deduction => {
            const key = `${deduction.userId}`;
            deductionsMap[key] = (deductionsMap[key] || 0) + deduction.amount;
        });

        const incentivesMap = {};
        approvedIncentives.forEach(incentive => {
            const key = `${incentive.userId}`;
            incentivesMap[key] = (incentivesMap[key] || 0) + incentive.amount;
        });

        const updatedPayroll = payrollData.map(batch => ({
            batch_id: batch.batch_id,
            employees: batch.employees.map(employee => {
                if (!employee || !employee.employee_id) return null;

                const key = `${employee.employee_id}`;
                const benefitsDeductionsAmount = deductionsMap[key] || 0;
                const incentiveAmount = incentivesMap[key] || 0;
                const salary = parseFloat(employee.salary) || 0;
                const adjustedSalary = (salary + incentiveAmount - benefitsDeductionsAmount).toFixed(2);

                return {
                    batch_id: batch.batch_id,
                    employee_id: employee.employee_id,
                    employee_firstname: employee.employee_firstname,
                    employee_lastname: employee.employee_lastname,
                    position: employee.position,
                    totalWorkHours: employee.totalWorkHours,
                    totalOvertimeHours: employee.totalOvertimeHours,
                    hourlyRate: employee.hourlyRate,
                    overtimeRate: employee.overtimeRate,
                    holidayRate: employee.holidayRate,
                    salary: employee.salary,
                    benefitsDeductionsAmount,
                    incentiveAmount,
                    adjustedSalary
                };
            }).filter(emp => emp !== null)
        }));

        res.status(200).json({ success: true, data: updatedPayroll });
    } catch (error) {
        console.error(`Error in fetching payroll with deductions and incentives: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const finalizePayroll = async (req, res) => {
    try {
        const { batch_id } = req.body;

        if (!batch_id) {
            return res.status(400).json({ success: false, message: "Batch ID is required" });
        }

        const serviceToken = generateServiceToken();

        const payrollResponse = await axios.get(
            "http://localhost:7687/api/salaryRequest/get-payroll-with-deductions",
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const payrollData = payrollResponse.data.data.find(batch => batch.batch_id === batch_id);

        if (!payrollData) {
            return res.status(404).json({ success: false, message: `No payroll data found for batch ${batch_id}` });
        }

        const employeeIds = payrollData.employees.map(emp => emp.employee_id);

        const payrollHistoryRecords = payrollData.employees.map(emp => ({
            batch_id: batch_id,
            employee_id: emp.employee_id,
            employee_firstname: emp.firstname || emp.first_name || "Unknown",
            employee_lastname: emp.lastname || emp.last_name || "Unknown",
            position: emp.position,
            totalWorkHours: emp.totalWorkHours,
            totalOvertimeHours: emp.totalOvertimeHours,
            hourlyRate: emp.hourlyRate,
            overtimeRate: emp.overtimeRate,
            holidayRate: emp.holidayRate,
            salary: emp.salary,
            benefitsDeductionsAmount: emp.benefitsDeductionsAmount,
            incentiveAmount: emp.incentiveAmount,
            adjustedSalary: emp.adjustedSalary,
        }));

        console.log("Payroll History Records to be inserted:", payrollHistoryRecords);

        await PayrollHistory.insertMany(payrollHistoryRecords);

        await IncentiveTracking.updateMany(
            { userId: { $in: employeeIds }, isAlreadyAdded: false },
            { $set: { isAlreadyAdded: true } }
        );

        await BenefitDeduction.updateMany(
            { userId: { $in: employeeIds }, isAlreadyAdded: false },
            { $set: { isAlreadyAdded: true } }
        );

        await Attendance.updateMany(
            { batch_id: batch_id },
            { $set: { isFinalized: true } }
        );

        const latestBatch = await Batch.findOne().sort({ created_at: -1 });

        if (latestBatch) {
            console.log(`Deleting the latest batch with ID: ${latestBatch.batch_id}`);
            await Batch.deleteOne({ _id: latestBatch._id });
        }

 
        const newBatchId = `batch-${Date.now()}`;
        console.log(`New batch ID generated: ${newBatchId}`);


        const newBatch = new Batch({
            batch_id: newBatchId,
            expiration_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });

        await newBatch.save();

        console.log(`Payroll for batch ${batch_id} finalized. New batch ${newBatchId} created.`);

        res.status(200).json({
            success: true,
            message: `Payroll for batch ${batch_id} finalized successfully. New batch ${newBatchId} created.`,
            new_batch_id: newBatchId
        });

    } catch (error) {
        console.error(`Error in finalizing payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllPayrollHistory = async (req, res) => {
    try {
      // Group payroll history by batch_id
      const payrollHistory = await PayrollHistory.aggregate([
        {
          $group: {
            _id: "$batch_id",  // Group by batch_id
            payrolls: { $push: "$$ROOT" },  // Push the entire document into the 'payrolls' array
          },
        },
        {
          $sort: { "_id": -1 },  // Sort the results by batch_id (descending order)
        },
      ]);
  
      if (payrollHistory.length === 0) {
        return res.status(404).json({ message: "No payroll history found." });
      }
  
      return res.status(200).json(payrollHistory);
    } catch (error) {
      console.error("Error fetching payroll history:", error);
      return res.status(500).json({ message: "Failed to retrieve payroll history." });
    }
  };

export const requestSalaryDistribution = async (req, res) => {
    try {
        const { paymentMethod, gCashNumber } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const settings = await RequestSettings.findOne();
        if (!settings || !settings.isAvailable) {
            return res.status(403).json({ message: 'Salary requests are currently not available.' });
        }

        const existingRequest = await SalaryRequest.findOne({ userId: req.user._id, status: 'Pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already sent a salary request that is still pending.' });
        }

        const newRequestSalaryDistribution = new SalaryRequest({
            userId: req.user._id,
            paymentMethod,
            gCashNumber: paymentMethod === 'GCash' ? gCashNumber : null,
        });

        await newRequestSalaryDistribution.save();

        return res.status(201).json({ message: 'Salary request created successfully.', newRequestSalaryDistribution });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getMySalaryDistributionRequests = async (req, res) => {
    try {
        if(!req.user || !req.user._id){
            return res.status(401).json({message:'User not authenticated.'});
        }

        const mySalaryDistributionRequests = await SalaryRequest.find({userId: req.user._id})
        res.status(200).json({ success: true, data: mySalaryDistributionRequests });
    } catch (error) {
        console.log(`Error in getting my salary requests: ${error}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllSalaryDistributionRequests = async (req, res) => {
    try {
        // Generate service token
        const serviceToken = generateServiceToken();

        // Fetch user details from external API
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` }
            }
        );

        const users = response.data; // Get users from API response

        // Fetch all salary distribution requests
        const allSalaryDistributionRequests = await SalaryRequest.find();

        // Attach user firstName and lastName to salary distribution requests
        const updatedSalaryDistributionRequests = allSalaryDistributionRequests.map(request => {
            const user = users.find(user => user._id.toString() === request.userId.toString());
            return {
                ...request.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null
            };
        });

        res.status(200).json({ success: true, data: updatedSalaryDistributionRequests });
    } catch (error) {
        console.log(`Error in getting salary requests: ${error}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const reviewSalaryDistributionRequest = async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body;

    try {
        const requestedSalary = await SalaryRequest.findById(requestId);
        if (!requestedSalary) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (requestedSalary.status !== 'Pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        requestedSalary.status = action === 'approved' ? 'Approved' : 'Rejected';
        await requestedSalary.save();

        return res.status(200).json({ message: 'Request updated', requestedSalary });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const toggleRequestAvailability = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access forbidden: Only managers can perform this action.' });
        }

        let settings = await RequestSettings.findOne();
        if (!settings) {
            settings = await RequestSettings.create({ isAvailable: false });
        }

        settings.isAvailable = !settings.isAvailable;
        await settings.save();

        return res.status(200).json({ message: `Salary requests ${settings.isAvailable ? 'enabled' : 'disabled'}.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
