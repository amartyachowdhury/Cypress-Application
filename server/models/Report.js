import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        },
        status: {
            type: String,
            enum: ['open', 'in progress', 'resolved'],
            default: 'open'
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        images: [{
            type: String, // URLs to uploaded images
            required: false
        }],
        address: {
            type: String,
            required: false
        },
        category: {
            type: String,
            enum: ['infrastructure', 'safety', 'environment', 'noise', 'other'],
            default: 'other'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);
export default Report;