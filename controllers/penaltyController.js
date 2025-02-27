import { PenaltyLevel } from "../models/penaltyModel.js";

export const createPenaltyLevel = async (req, res) => {
  try {
    const { violationType, penaltyLevel, action, consequence } = req.body;

    if (!violationType || !penaltyLevel || !action || !consequence) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (![1, 2, 3].includes(penaltyLevel)) {
      return res.status(400).json({ message: 'Invalid penalty level' });
    }

    const newPenaltyLevel = new PenaltyLevel({
      violationType,
      penaltyLevel,
      action,
      consequence
    });

    await newPenaltyLevel.save();

    return res.status(201).json({ message: 'Penalty level created successfully', penaltyLevel: newPenaltyLevel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getPenaltyLevels = async (req, res) => {
  try {
    const allPenaltyLevels = await PenaltyLevel.find();

    if (!allPenaltyLevels.length) {
      return res.status(404).json({ message: 'No penalty levels found' });
    }

    return res.status(200).json({ allPenaltyLevels });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePenaltyLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { violationType, penaltyLevel, action, consequence } = req.body;

    const penalty = await PenaltyLevel.findById(id);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty level not found' });
    }

    penalty.violationType = violationType || penalty.violationType;
    penalty.penaltyLevel = penaltyLevel || penalty.penaltyLevel;
    penalty.action = action || penalty.action;
    penalty.consequence = consequence || penalty.consequence;

    await penalty.save();

    return res.status(200).json({ message: 'Penalty level updated successfully', penalty });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePenaltyLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const penalty = await PenaltyLevel.findByIdAndDelete(id);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty level not found' });
    }

    return res.status(200).json({ message: 'Penalty level deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
