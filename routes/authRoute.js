import express from 'express';
import { getAllUsers, loginAccount, logoutAccount, RegisterAccount } from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);
authRoute.post("/login",loginAccount);
authRoute.post("/logout",logoutAccount);

export default authRoute;