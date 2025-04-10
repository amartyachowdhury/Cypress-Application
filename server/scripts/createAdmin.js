import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Create Admin Schema and Model
const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Admin = mongoose.model('Admin', adminSchema);

const createInitialAdmin = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://amartyachowdhury47:n7siroDTMYGF7OEu@cypresscluster.yxh8ymm.mongodb.net/?retryWrites=true&w=majority&appName=CypressCluster';
        
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@cypress.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create new admin
        const admin = new Admin({
            email: 'admin@cypress.com',
            password: 'admin123', // This will be hashed automatically
            name: 'System Admin',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the function
createInitialAdmin(); 