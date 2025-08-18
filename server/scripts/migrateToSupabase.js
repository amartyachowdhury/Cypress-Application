import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from '../config/supabase.js';

dotenv.config();

// MongoDB Models (for reading existing data)
const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isVerified: Boolean,
    role: String,
    createdAt: Date
});

const reportSchema = new mongoose.Schema({
    title: String,
    description: String,
    severity: String,
    status: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Report = mongoose.model('Report', reportSchema);

const migrateData = async () => {
    try {
        console.log('🔄 Starting migration from MongoDB to Supabase...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Migrate Users
        console.log('📊 Migrating users...');
        const users = await User.find({ isVerified: true });
        
        for (const user of users) {
            try {
                // Create user in Supabase Auth (you'll need to handle this manually)
                console.log(`Creating user profile for: ${user.email}`);
                
                // Create user profile in our users table
                await db.createUser({
                    id: user._id.toString(), // Use MongoDB ID as UUID
                    email: user.email,
                    name: user.username || user.email.split('@')[0]
                });
                
                console.log(`✅ Migrated user: ${user.email}`);
            } catch (error) {
                console.error(`❌ Failed to migrate user ${user.email}:`, error.message);
            }
        }

        // Migrate Reports
        console.log('📊 Migrating reports...');
        const reports = await Report.find().populate('createdBy');
        
        for (const report of reports) {
            try {
                // Convert location to PostGIS format
                const locationData = report.location && report.location.coordinates ? 
                    `POINT(${report.location.coordinates[0]} ${report.location.coordinates[1]})` : null;

                const reportData = {
                    id: report._id.toString(), // Use MongoDB ID as UUID
                    title: report.title,
                    description: report.description,
                    severity: report.severity || 'low',
                    status: report.status || 'open',
                    category: 'other', // Default category
                    location: locationData,
                    created_by: report.createdBy?._id?.toString() || null,
                    created_at: report.createdAt,
                    updated_at: report.createdAt
                };

                await db.createReport(reportData);
                console.log(`✅ Migrated report: ${report.title}`);
            } catch (error) {
                console.error(`❌ Failed to migrate report ${report.title}:`, error.message);
            }
        }

        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateData();
}

export default migrateData;
