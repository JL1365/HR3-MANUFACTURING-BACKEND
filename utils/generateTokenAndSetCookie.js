import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res,user) => {
    try {
        const token = jwt.sign({ userId:user._id,role:user.role,Hr: user.Hr }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        //first token is name and the second token is value
        res.cookie("token",token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // equals to 7 days
        });
        return token;
    } catch (error) {
        console.log(`Error generating token! ${error}`);
        throw error;
    }
};