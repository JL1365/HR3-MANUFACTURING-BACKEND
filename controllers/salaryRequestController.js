import { RequestSettings } from "../models/requestSettingModel.js";
import { SalaryRequest } from "../models/salaryRequestModel.js";
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";
import axios from "axios";

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
