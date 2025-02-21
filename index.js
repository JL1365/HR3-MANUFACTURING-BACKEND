//IMPORTS PACKAGES
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'

import { connectDB } from './config/db.js';

//Routes
import authRoute from './routes/authRoute.js';
import benefitRoute from './routes/benefitRoute.js';
import benefitRequestRoute from './routes/benefitRequestRoute.js';
import benefitDeductionRoute from './routes/benefitDeductionRoute.js';

dotenv.config(); //loads variable defined in .env
connectDB(); //Establishes a connection to MongoDB 

const app = express()
const PORT = process.env.PORT || 7687;

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.NODE_ENV === "production"
    ? "https://hr3.jjm-manufacturing.com"
    : "http://localhost:5173",
credentials: true,
}));

app.use("/api/auth",authRoute);
app.use("/api/benefit",benefitRoute);
app.use("/api/benefitRequest",benefitRequestRoute);
app.use("/api/benefitDeduction",benefitDeductionRoute);

app.listen(PORT,()=> {
    console.log(`Server is running ${PORT}`);
})