import mongoose from "mongoose";

const userSchema = await mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["Admin","Employee"],
        default:"Employee"
    }
},{timestamps:true});

export const User = mongoose.model("User",userSchema);