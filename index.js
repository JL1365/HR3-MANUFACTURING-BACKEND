//IMPORTS PACKAGES
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';

//Routes
import authRoute from './routes/authRoute.js';

dotenv.config(); //loads variable defined in .env
connectDB(); //Establishes a connection to MongoDB 

const app = express()
const PORT = process.env.PORT || 7687;

app.use(express.json());
app.use(cookieParser())

app.use("/api/auth",authRoute);

app.listen(PORT,()=> {
    console.log(`Server is running ${PORT}`);
})