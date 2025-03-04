import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
        }
    }

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.userId, role: decoded.role, Hr: decoded.Hr };
        next();
    } catch (error) {
        console.log("Token verification error:", error.message);
        return res.status(403).json({ success: false, message: "Token is not valid" });
    }
};

// VERIFY TOKEN FROM API GATEWAY
export const serviceVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    jwt.verify(token, process.env.SERVICE_JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded; // Store decoded user data
        next();
    });
};
