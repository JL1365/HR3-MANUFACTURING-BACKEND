import express from 'express';
import { changeHr, checkAuth, getAllPositions, getAllUsers, loginAccount, logoutAccount, RegisterAccount } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { generateServiceToken } from '../middleware/gatewayTokenGenerator.js';
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { LoginActivity } from '../models/loginActivityModel.js';

const authRoute = express.Router();

authRoute.post("/register-account",RegisterAccount);
authRoute.get("/get-all-users",getAllUsers);
authRoute.get("/get-all-positions",getAllPositions);
authRoute.post("/login",loginAccount);
authRoute.post("/logout",logoutAccount);
// authRoute.post("/testLog", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const serviceToken = generateServiceToken();

//     const response = await axios.get(
//       `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
//       {
//         headers: { Authorization: `Bearer ${serviceToken} `},
//       }
//     );

//     const users = response.data;
//     const user = users.find((u) => u.email === email);

//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }
//     const token = generateTokenAndSetCookie(res, user);
//     return res.status(200).json({ token, user });
//   } catch (err) {
//     console.error("Error during login:", err.message);
//     return res.status(500).json({ message: "Server error" });
//   }
// });
import useragent from "useragent";

authRoute.post("/testLog", async (req, res) => {
  try {
    const { email, password } = req.body;
    const serviceToken = generateServiceToken();
    const userAgent = useragent.parse(req.headers["user-agent"]);
    const ipAddress =
    process.env.NODE_ENV === "production"
      ? req.headers["x-forwarded-for"]?.split(",")[0] || "Unknown"
      : req.socket.remoteAddress || "Unknown";
  
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;
    const user = users.find((u) => u.email === email);

    if (!user) {
     
      await LoginActivity.create({
        email,
        loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Failed" }],
        failedLoginAttempts: 1,
        deviceInfo: userAgent.toString(),
      });

      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
     
      await LoginActivity.findOneAndUpdate(
        { user_id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
        { upsert: true }
      );

      await LoginActivity.updateOne(
        { user_id: user._id },
        {
          $push: {
            loginHistory: {
              ipAddress,
              device: userAgent.toString(),
              status: "Failed",
            },
          },
        }
      );

      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateTokenAndSetCookie(res, user);

    const loginRecord = await LoginActivity.findOne({ user_id: user._id });

    if (loginRecord) {
      loginRecord.loginCount += 1;
      loginRecord.lastLogin = new Date();
      loginRecord.failedLoginAttempts = 0; 
      loginRecord.deviceInfo = userAgent.toString();
      loginRecord.loginHistory.push({
        ipAddress,
        device: userAgent.toString(),
        status: "Success",
      });
      await loginRecord.save();
    } else {
      await LoginActivity.create({
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position,
        Hr: user.Hr,
        loginCount: 1,
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        deviceInfo: userAgent.toString(),
        loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Success" }],
      });
    }

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

authRoute.get("/get-login-activities", async (req, res) => {
  try {
    const loginActivities = await LoginActivity.find()
      .sort({ lastLogin: -1 })
      .lean();

    return res.status(200).json({ success: true, data: loginActivities });
  } catch (err) {
    console.error("Error fetching login activities:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

authRoute.get("/check-auth",verifyToken,checkAuth);
authRoute.put("/change-hr",verifyToken,changeHr);


authRoute.get("/protected-get-accounts-from-admin", verifyToken, async (req, res) => {
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