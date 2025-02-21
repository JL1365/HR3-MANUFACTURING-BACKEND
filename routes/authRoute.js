import express from 'express';
import { getAllUsers, loginAccount, RegisterAccount } from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);
authRoute.post("/login",loginAccount);

export default authRoute;