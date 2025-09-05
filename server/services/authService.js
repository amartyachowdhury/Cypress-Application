import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { config } from '../config/index.js';

export class AuthService {
    static generateToken(user) {
        return jwt.sign(
            { _id: user._id.toString() },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    static async registerUser(userData) {
        const { name, email, password } = userData;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        return user;
    }

    static async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await this.comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    static async loginAdmin(email, password) {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Invalid admin credentials');
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid admin credentials');
        }

        return admin;
    }
}
