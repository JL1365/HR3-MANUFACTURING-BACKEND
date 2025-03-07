import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["Admin","Employee","Superadmin"],
        default:"Employee"
    },
    position:{
        type:String,
        enum:["CEO","Secretary","Production Head","Resellers Sales Head","Resellers"]
    },
    Hr:{
        type:Number,
        enum:[1,2,3,4]
    }
},{timestamps:true});

export const User = mongoose.model("User",userSchema);