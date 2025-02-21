import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`); //LOGGING THE CONNECTION INFO
       // process.exit(0); //Exits the process successfully (no errors)
    } catch (error) {
        console.log(`Error in Connecting DB ${error.message}`)
        process.exit(1); // Exits the process with an error (something went wrong).
    }
}