import express from 'express';
import { checkAuth, getAllUsers, loginAccount, logoutAccount, RegisterAccount } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);
authRoute.post("/login",loginAccount);
authRoute.post("/logout",logoutAccount);
authRoute.get("/check-auth",verifyToken,checkAuth);


export default authRoute;