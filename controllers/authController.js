import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const RegisterAccount = async (req, res) => {
    try {
        const { email, username, firstName, lastName, password,role,Hr ,position} = req.body;

        // Check for missing fields
        if (!email || !username || !firstName || !lastName || !password,!Hr) {
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
            role,
            Hr,
            position
        });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully!",newUser });
    } catch (error) {
        console.error("Error in RegisterAccount:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req,res) => {
    try {
        const users = await User.find({}); //Get all users
        if(users.length === 0){
            return res.status(404).json({message:"No users found!"}) //verifying if there are no users found
        }
        res.status(200).json({message:"Fetching users successfully!",users});
    } catch (error) {
        console.log(`Error in getting users: ${error.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const loginAccount = async (req,res) => {
    try {
        // add validation if youare already login
        const token = req.cookies.token;
        if(token){
            return res.status(400).json({message:"You are already logged in"});
        }
        const {identifier,password} = req.body;
        
        if(!identifier||!password){
            return res.status(400).json({message:"All fields are required!"});
        }
        //Check if its email or username
        const isEmail = /\S+@\S+\.\S+/.test(identifier);
        //Find email or username in database
        const user = await User.findOne({
            [isEmail ? 'email' : 'username']:identifier
        });

        if(!user){
            return res.status(400).json({message:isEmail ? 'Email not found!' : 'Username not found!'});
        }
        //Checking if password match in username or email of a user
        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({message:"Password does not match!"});
        }
        generateTokenAndSetCookie(res,user)
        res.status(200).json({message:"Logged in successfully!", user});
    } catch (error) {
        console.log(`Error in Login: ${error.message}`);
        return res.status(500).json({message:"Internal server error!"});
    }
}

export const logoutAccount = async (req, res) => {
    try {
        if(!req.cookies.token){
            return res.status(400).json({ success: false, message: "You are not logged in" });
        }
        const userId = req.user;
        const user = await User.findById(userId);
        //It will clear the token 
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ success: true, message: "Logged out successfully",user });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ success: false, message: "Server error during logout" });
    }
};

export const checkAuth = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated!" });
    }
    res.status(200).json({ message: "User is authenticated!", user: req.user });
};


export const changeHr = async (req, res) => {
    try {
        const { changeHRNumber } = req.body;

        if (!changeHRNumber) {
            return res.status(400).json({ success: false, message: "Change HR number is required." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.Hr = changeHRNumber;
        await user.save();

        const newToken = generateTokenAndSetCookie(res, user);

        return res.status(200).json({ success: true, message: "HR number updated successfully", user, token: newToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};