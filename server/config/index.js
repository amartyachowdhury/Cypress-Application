import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5050,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
