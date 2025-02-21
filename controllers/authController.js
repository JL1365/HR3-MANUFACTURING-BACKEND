import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

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
        generateTokenAndSetCookie(res,user._id)
        res.status(200).json({message:"Logged in successfully!", user});
    } catch (error) {
        console.log(`Error in Login: ${error.message}`);
        return res.status(500).json({message:"Internal server error!"});
    }
}