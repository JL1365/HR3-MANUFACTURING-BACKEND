import express from 'express';
import { changeHr, checkAuth, getAllPositions, getAllUsers, loginAccount, logoutAccount, RegisterAccount } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { generateServiceToken } from '../middleware/gatewayTokenGenerator.js';
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);
authRoute.get("/get-all-positions",getAllPositions);
authRoute.post("/login",loginAccount);
authRoute.post("/logout",logoutAccount);
authRoute.post("/testLog", async (req, res) => {
  try {
    const { email, password } = req.body;

    const serviceToken = generateServiceToken();

    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken} `},
      }
    );

    const users = response.data;
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = generateTokenAndSetCookie(res, user);
    return res.status(200).json({ token, user });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

authRoute.get("/check-auth",verifyToken,checkAuth);
authRoute.put("/change-hr",verifyToken,changeHr);


authRoute.get("/protected", verifyToken, async (req, res) => {
  try {
    // Generate the service token for API authentication
    const serviceToken = generateServiceToken();

    // Make the API call to fetch real data from the API Gateway
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization:` Bearer ${serviceToken}` },
      }
    );

    // Log the fetched data to the server console
    console.log("Fetched data:", response.data);

    // Return the fetched data to the client instead of a static message
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default authRoute;