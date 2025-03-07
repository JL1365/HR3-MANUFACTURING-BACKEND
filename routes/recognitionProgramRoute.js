import express from 'express';
import { createRecognitionPrograms, 
    deleteRecognitionProgram, 
    getAllRecognitionPrograms, 
    getMyRecognitionAwards, 
    updateMyRecognitionProgramStatus, 
    updateRecognitionProgram 
} from '../controllers/recognitionProgramController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const recognitionProgramRoute = express.Router();

recognitionProgramRoute.post("/create-recognition-program",createRecognitionPrograms);
recognitionProgramRoute.get("/get-all-recognition-programs",getAllRecognitionPrograms);
recognitionProgramRoute.put("/update-recognition-program/:id", verifyToken, updateRecognitionProgram);
recognitionProgramRoute.delete("/delete-recognition-program/:id", verifyToken, deleteRecognitionProgram);

recognitionProgramRoute.get("/get-my-recognition-programs",verifyToken,getMyRecognitionAwards);
recognitionProgramRoute.put("/update-my-recognition-program-status/:id", updateMyRecognitionProgramStatus);

export default recognitionProgramRoute;