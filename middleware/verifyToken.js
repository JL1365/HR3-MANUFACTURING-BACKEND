import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers['Authorization']?.split(' ')[1];

    if(!token){
        console.log("No token provided");
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {_id: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        console.log("Token verification error:", error.message);
        return res.status(403).json({ success: false, message: "Token is not valid" });
    }
};
