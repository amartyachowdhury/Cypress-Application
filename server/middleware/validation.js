import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.VALIDATION_ERROR,
                details: error.details[0].message
            });
        }
        
        next();
    };
};
