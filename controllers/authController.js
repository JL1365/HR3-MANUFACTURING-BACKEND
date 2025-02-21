import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";

export const RegisterAccount = async (req, res) => {
    try {
        const { email, username, firstName, lastName, password,role } = req.body;

        // Check for missing fields
        if (!email || !username || !firstName || !lastName || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long!" });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one uppercase letter!" });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one lowercase letter!" });
        }
        if (!/\d/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one number!" });
        }
        if (!/[\W_]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one special character!" });
        }

        // Check if email or username already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or username already exists!" });
        }

        // Hash password (only if valid)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const newUser = new User({
            email,
            username,
            firstName,
            lastName,
            password: hashedPassword, //It will store hashed in Database
            role
        });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully!",newUser });
    } catch (error) {
        console.error("Error in RegisterAccount:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
