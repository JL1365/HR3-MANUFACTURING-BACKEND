import jwt from 'jsonwebtoken';

export const generateServiceToken = () => {
    const payload = { service: 'Hr 3' };
    const token = jwt.sign(payload, process.env.GATEWAY_JWT_SECRET, { expiresIn: '10m' });
    console.log("Generated Service Token:", token);
    return token;
};
