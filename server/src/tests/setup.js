import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Setup test database
global.beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
global.afterEach(async() => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
global.afterAll(async() => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  createTestUser: async(userData = {}) => {
    const UserModel = (await import('../models/User.js')).default;
    return await UserModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      ...userData,
    });
  },

  createTestAdmin: async(adminData = {}) => {
    const Admin = (await import('../models/Admin.js')).default;
    return await Admin.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'admin123',
      ...adminData,
    });
  },

  createTestReport: async(reportData = {}) => {
    const Report = (await import('../models/Report.js')).default;

    const user = await global.testUtils.createTestUser();

    return await Report.create({
      title: 'Test Report',
      description: 'Test Description',
      severity: 'low',
      category: 'other',
      status: 'pending',
      createdBy: user._id,
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128], // NYC coordinates
      },
      ...reportData,
    });
  },
};
