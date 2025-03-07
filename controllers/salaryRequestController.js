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

export const calculatePayroll = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        // Fetch attendance data directly from the attendance model
        const attendanceData = await Attendance.find(); // Querying directly from the attendance model

        // Fetch compensation plans
        const compensationPlans = await CompensationPlanning.find();

        // Fetch users to map positions (you can keep the external call here for users if needed)
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

        // Store compensation plans in a map using positionName as key
        const compensationMap = {};
        formattedPlans.forEach(plan => {
            compensationMap[plan.positionName] = plan;
        });

        const defaultHourlyRate = 110;
        const defaultOvertimeRate = 75;
        const defaultHolidayRate = 30;

        const payrollMap = {};

        attendanceData.forEach(attendance => {
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

            if (!payrollMap[employeeId]) {
                payrollMap[employeeId] = {
                    ...attendance,
                    totalWorkHours,
                    totalOvertimeHours,
                    hourlyRate,
                    overtimeRate,
                    holidayRate
                };
            } else {
                payrollMap[employeeId].totalWorkHours += totalWorkHours;
                payrollMap[employeeId].totalOvertimeHours += totalOvertimeHours;
            }
        });

        const payrollData = Object.values(payrollMap).map(employee => {
            const salary = (employee.totalWorkHours * employee.hourlyRate) + (employee.totalOvertimeHours * employee.overtimeRate);

            return {
                employee_id: employee.employee_id,
                employee_firstname: employee.employee_firstname,
                employee_lastname: employee.employee_lastname,
                position: employee.position,
                totalWorkHours: employee.totalWorkHours,
                totalOvertimeHours: employee.totalOvertimeHours,
                hourlyRate: employee.hourlyRate,
                overtimeRate: employee.overtimeRate,
                holidayRate: employee.holidayRate,
                salary: salary.toFixed(2)
            };
        });

        res.status(200).json({ success: true, data: payrollData });
    } catch (error) {
        console.error(`Error in calculating payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
export const getPayrollWithDeductionsAndIncentives = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        // Fetch payroll calculation data
        const payrollResponse = await axios.get(
            `http://localhost:7687/api/salaryRequest/calculate-payroll`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );
        const payrollData = payrollResponse.data.data;

        // Fetch all benefit deductions and incentives
        const deductions = await BenefitDeduction.find();
        const incentives = await IncentiveTracking.find();

        // Map deductions by employee ID
        const deductionsMap = {};
        deductions.forEach(deduction => {
            const employeeId = deduction.userId.toString();
            if (!deductionsMap[employeeId]) {
                deductionsMap[employeeId] = 0;
            }
            deductionsMap[employeeId] += deduction.amount; // Total deductions per employee
        });

        // Map incentives by employee ID
        const incentivesMap = {};
        incentives.forEach(incentive => {
            const employeeId = incentive.userId.toString();
            if (!incentivesMap[employeeId]) {
                incentivesMap[employeeId] = 0;
            }
            incentivesMap[employeeId] += incentive.amount; // Total incentives per employee
        });

        // Process payroll data and apply deductions/incentives
        const updatedPayroll = payrollData.map(employee => {
            const employeeId = employee.employee_id.toString();
            const benefitsDeductionsAmount = deductionsMap[employeeId] || 0;
            const incentiveAmount = incentivesMap[employeeId] || 0;

            // Final salary calculation
            const adjustedSalary = (parseFloat(employee.salary) + incentiveAmount - benefitsDeductionsAmount).toFixed(2);

            return {
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
        });

        // Respond with the calculated payroll data
        res.status(200).json({ success: true, data: updatedPayroll });
    } catch (error) {
        console.error(`Error in fetching payroll with deductions and incentives: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const finalizePayroll = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        // Fetch payroll data to be saved in history
        const payrollResponse = await axios.get(
            `http://localhost:7687/api/salaryRequest/get-payroll-with-deductions`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );
        const payrollData = payrollResponse.data.data;

        // Save payroll history
        await PayrollHistory.insertMany(payrollData);

        // Reset incentives and benefits only
        await IncentiveTracking.deleteMany({});
        await BenefitDeduction.deleteMany({});

        res.status(200).json({ success: true, message: "Payroll finalized and reset successfully" });
    } catch (error) {
        console.error(`Error in finalizing payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// export const manualResetPayroll = async (req, res) => {
//     try {
//         console.log("🔄 Initiating manual payroll reset...");

//         // Fetch all payroll data with employee details
//         const payrollData = await Payroll.find().populate("employeeId", "name");

//         // Fetch all benefit deductions
//         const benefitDeductions = await BenefitDeduction.find();

//         // Fetch all incentive tracking data
//         const incentives = await IncentiveTracking.find();

//         // Map payroll data and include employee name, benefits, and incentives
//         const payrollHistoryData = payrollData.map(employee => {
//             // Hanapin ang matching benefit deductions at incentives
//             const employeeBenefits = benefitDeductions.filter(b => String(b.employeeId) === String(employee.employeeId._id));
//             const employeeIncentives = incentives.filter(i => String(i.employeeId) === String(employee.employeeId._id));

//             return {
//                 employeeId: employee.employeeId._id,
//                 name: employee.employeeId.name, // Include Employee Name
//                 salary: employee.salary,
//                 benefitsDeductions: employeeBenefits.map(b => ({
//                     type: b.type, // Halimbawa: SSS, Pag-IBIG, PhilHealth
//                     amount: b.amount
//                 })),
//                 incentiveDetails: employeeIncentives.map(i => ({
//                     type: i.type, // Halimbawa: Performance Bonus, Attendance Incentive
//                     amount: i.amount
//                 })),
//                 adjustedSalary: employee.adjustedSalary
//             };
//         });

//         // Save to PayrollHistory before reset
//         if (payrollHistoryData.length > 0) {
//             await PayrollHistory.insertMany(payrollHistoryData);
//             console.log("Payroll history saved successfully");
//         } else {
//             console.log("⚠️ No payroll data to save in history.");
//         }

//         // Reset Payroll Data
//         await Payroll.updateMany({}, { salary: 0, benefitsDeductionsAmount: 0, incentiveAmount: 0, adjustedSalary: 0 });
//         console.log("Payroll reset successfully");

//         // Reset Benefit Deductions
//         await BenefitDeduction.updateMany({}, { amount: 0 });
//         console.log("Benefit deductions reset successfully");

//         // Reset Incentive Tracking
//         await IncentiveTracking.updateMany({}, { amount: 0 });
//         console.log("Incentive tracking reset successfully");

//         res.status(200).json({ success: true, message: "Payroll reset successfully!" });
//     } catch (error) {
//         console.error(" Error resetting payroll:", error.message);
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };

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
