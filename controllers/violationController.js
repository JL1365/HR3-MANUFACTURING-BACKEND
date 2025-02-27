import { PenaltyLevel } from "../models/penaltyModel.js";
import { Violation } from "../models/violationModel.js";
import { User } from "../models/userModel.js";

export const createViolation = async (req, res) => {
  try {
    const { userId, penaltyLevel, violationDate, comments } = req.body;

    if (!userId|| !penaltyLevel || !violationDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const penaltyLevelExists = await PenaltyLevel.findById(penaltyLevel);
    if (!penaltyLevelExists) {
      return res.status(404).json({ message: 'Penalty level not found' });
    }

    const newViolation = new Violation({
      userId,
      penaltyLevel,
      violationDate,
      comments
    });

    await newViolation.save();

    return res.status(201).json({ message: 'Violation created successfully', violation: newViolation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getViolations = async (req, res) => {
  try {
    const employeeViolations = await Violation.find().populate('penaltyLevel')
    .populate('userId', 'firstName lastName');

    if (!employeeViolations.length) {
      return res.status(404).json({ message: 'No employeeViolations found' });
    }

    return res.status(200).json({ employeeViolations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
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
