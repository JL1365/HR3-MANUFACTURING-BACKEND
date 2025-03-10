import * as tf from '@tensorflow/tfjs';
import PayrollHistory from '../models/PayrollHistory.js';
import mongoose from 'mongoose';
import PayrollPredictionModel from '../models/payrollPredictionModel.js';

const fetchPayrollData = async () => {
    try {
        const records = await PayrollHistory.find();
        
        if (records.length === 0) {
            console.log("No payroll records found.");
            return [];
        }

        const groupedRecords = records.reduce((acc, record) => {
            if (!acc[record.employee_id]) {
                acc[record.employee_id] = {
                    employee_id: new mongoose.Types.ObjectId(record.employee_id),
                    employee_firstname: record.employee_firstname,
                    employee_lastname: record.employee_lastname,
                    totalAdjustedSalary: 0,
                    payrollCount: 0,
                    totalWorkHours: 0,
                    totalOvertimeHours: 0,
                    hourlyRate: record.hourlyRate,
                    overtimeRate: record.overtimeRate,
                    holidayRate: record.holidayRate,
                    benefitsDeductionsAmount: 0,
                    incentiveAmount: 0,
                    payroll_date: record.payroll_date,
                };
            }

            acc[record.employee_id].totalAdjustedSalary += record.netSalary;
            acc[record.employee_id].payrollCount += 1;
            acc[record.employee_id].totalWorkHours += record.totalWorkHours;
            acc[record.employee_id].totalOvertimeHours += record.totalOvertimeHours;
            acc[record.employee_id].benefitsDeductionsAmount += record.benefitsDeductionsAmount;
            acc[record.employee_id].incentiveAmount += record.incentiveAmount;

            return acc;
        }, {});

        return Object.values(groupedRecords).map(employee => ({
            ...employee,
            averageSalary: employee.totalAdjustedSalary / employee.payrollCount,
        }));

    } catch (error) {
        console.error("Error fetching payroll data:", error);
        return [];
    }
};

const prepareData = (records) => {
    const inputs = records.map(record => ([
        record.totalWorkHours,
        record.totalOvertimeHours,
        record.hourlyRate,
        record.overtimeRate,
        record.holidayRate,
        record.benefitsDeductionsAmount,
        record.incentiveAmount
    ]));

    const outputs = records.map(record => record.averageSalary);

    return { inputs, outputs };
};

const trainModel = async (inputData, outputData) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [7] }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });

    const inputTensor = tf.tensor2d(inputData);
    const outputTensor = tf.tensor2d(outputData, [outputData.length, 1]);

    await model.fit(inputTensor, outputTensor, { epochs: 250, batchSize: 5 });

    return model;
};

const predictSalaries = async () => {
    const records = await fetchPayrollData();
    if (records.length === 0) {
        console.log("No payroll records found.");
        return [];
    }

    const { inputs, outputs } = prepareData(records);
    const model = await trainModel(inputs, outputs);

    const newInputs = tf.tensor2d(inputs);
    const predictions = model.predict(newInputs).arraySync();

    const predictedData = records.map((record, index) => ({
        employee_id: record.employee_id,
        employee_firstname: record.employee_firstname,
        employee_lastname: record.employee_lastname,
        predictedNetSalary: predictions[index][0] != null ? Math.round(predictions[index][0]) : 0,

        payroll_date: new Date(),
    }));
    console.log("Inputs for prediction:", inputs);
    console.log("Predictions:", predictions);
    
    console.log("Predicted Data:", predictedData);

    try {
        await PayrollPredictionModel.deleteMany({});

        const savedPredictions = await PayrollPredictionModel.insertMany(predictedData);
        console.log("Successfully saved predictions:", savedPredictions);

    } catch (err) {
        console.error("Error saving predictions:", err);
    }

    console.log("Predictions saved to PayrollPredictionModel.");

    return predictedData;
};

export { predictSalaries };
