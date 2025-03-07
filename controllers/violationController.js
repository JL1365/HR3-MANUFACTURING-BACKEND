import { PenaltyLevel } from "../models/penaltyModel.js";
import { Violation } from "../models/violationModel.js";
import { User } from "../models/userModel.js";

import axios from 'axios'; 
import { generateServiceToken } from "../middleware/gatewayTokenGenerator.js";

export const createViolation = async (req, res) => {
  try {
    const { userId, penaltyLevel, violationDate, comments } = req.body;

    if (!userId || !penaltyLevel || !violationDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const serviceToken = generateServiceToken();

    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`, 
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;  // Assuming this returns an array of users
    const user = users.find((u) => u._id === userId); // Match user by ID instead of email

    if (!user) {
      return res.status(404).json({ message: 'User not found in the admin system' });
    }

    // Validate penalty level
    const penaltyLevelExists = await PenaltyLevel.findById(penaltyLevel);
    if (!penaltyLevelExists) {
      return res.status(404).json({ message: 'Penalty level not found' });
    }

    // Create new violation
    const newViolation = new Violation({
      userId,
      penaltyLevel,
      violationDate,
      comments,
    });

    await newViolation.save();

    return res.status(201).json({ message: 'Violation created successfully', violation: newViolation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEmployeeViolations = async (req, res) => {
  try {
    // Generate service token
    const serviceToken = generateServiceToken();

    // Fetch employees from the admin's API using the service token
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`, 
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;  // Assuming this returns an array of users

    // Fetch employee violations from your local database
    const employeeViolations = await Violation.find().populate('penaltyLevel');

    if (!employeeViolations.length) {
      return res.status(404).json({ message: 'No employee violations found' });
    }

    // Attach user details from the admin API to each violation
    const updatedViolations = employeeViolations.map((violation) => {
      const user = users.find((u) => u._id === violation.userId.toString());
      return {
        ...violation.toObject(),
        user: user ? { firstName: user.firstName, lastName: user.lastName } : null,
      };
    });

    return res.status(200).json({ employeeViolations: updatedViolations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateViolationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const violation = await Violation.findById(id);
    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    violation.status = status || violation.status;
    await violation.save();

    return res.status(200).json({ message: 'Violation status updated', violation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const violation = await Violation.findByIdAndDelete(id);

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    return res.status(200).json({ message: 'Violation deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyViolations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const myViolations = await Violation.find({ userId: req.user._id })
      .populate('penaltyLevel')
    if (!myViolations.length) {
      return res.status(404).json({ message: 'No violations found for this user' });
    }

    return res.status(200).json({ myViolations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
