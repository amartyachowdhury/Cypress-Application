// MongoDB initialization script
db = db.getSiblingDB('cypress_tracker');

// Create collections
db.createCollection('users');
db.createCollection('admins');
db.createCollection('reports');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "email": 1 }, { unique: true });
db.reports.createIndex({ "location": "2dsphere" });
db.reports.createIndex({ "createdBy": 1 });
db.reports.createIndex({ "status": 1 });
db.reports.createIndex({ "createdAt": -1 });

// Create default admin user
db.admins.insertOne({
  email: "admin@cypress.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: admin123
  name: "System Admin",
  role: "admin",
  createdAt: new Date()
});

print("Database initialized successfully!");
