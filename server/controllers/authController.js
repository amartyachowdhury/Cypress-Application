import { AuthService } from '../services/authService.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export const registerUser = async (req, res) => {
    try {
        const user = await AuthService.registerUser(req.body);
        const token = AuthService.generateToken(user);
        
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.loginUser(email, password);
        const token = AuthService.generateToken(user);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED
        });
    }
};
