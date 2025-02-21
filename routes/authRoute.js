import express from 'express';
import { getAllUsers, RegisterAccount } from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);

export default authRoute;