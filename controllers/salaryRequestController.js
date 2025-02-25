import { SalaryRequest } from "../models/salaryRequestModel.js";

export const requestSalaryDistribution = async (req, res) => {
    try {
        const { paymentMethod, gCashNumber } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        const requestedSalaryDistributions = await SalaryRequest.find();
        if(requestedSalaryDistributions.length > 0 && !requestedSalaryDistributions[0].isAvailable){
            return res.status(403).json({message:'Salary requests are currently not available.'});
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
        const allSalaryDistributionRequests = await SalaryRequest.find()
            .populate('userId', 'firstName lastName')
            .exec();

        res.status(200).json({ success: true, data: allSalaryDistributionRequests });
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

        const requestedSalaryDistributions = await SalaryRequest.find();
        const isAvailable = requestedSalaryDistributions.length > 0 && requestedSalaryDistributions[0].isAvailable;

        if (isAvailable) {
            await SalaryRequest.updateMany({}, { isAvailable: false });
            return res.status(200).json({ message: 'Salary requests forbidden.' });
        } else {
            await SalaryRequest.updateMany({}, { isAvailable: true });
            return res.status(200).json({ message: 'Salary requests reinstated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};