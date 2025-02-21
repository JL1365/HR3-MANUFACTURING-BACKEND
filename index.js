//IMPORTS PACKAGES
import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';

dotenv.config(); //loads variable defined in .env
connectDB(); //Establishes a connection to MongoDB 

const app = express()
const PORT = process.env.PORT || 7687;

app.listen(PORT,()=> {
    console.log(`Server is running ${PORT}`);
})