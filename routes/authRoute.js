import express from 'express';
import { RegisterAccount } from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);

export default authRoute;