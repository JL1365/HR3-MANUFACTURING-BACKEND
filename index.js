//IMPORTS PACKAGES
import express from 'express'
import dotenv from 'dotenv'

dotenv.config(); //loads variable defined in .env

const app = express()
const PORT = process.env.PORT || 7687

app.listen(PORT,()=> {
    console.log(`Server is running ${PORT}`);
})