// Complete MongoDB Setup Script
// Run this script to create all collections and indexes at once
// Usage: mongosh "your-connection-uri" < 00-complete-setup.js

print("========================================");
print("AccuCoder MongoDB Setup");
print("========================================\n");

// Ensure we're using the correct database
// Change 'accucoder' to your database name if different
db = db.getSiblingDB('accucoder');
print("Using database: " + db.getName() + "\n");

// ========================================
// 1. CREATE CHATHISTORIES COLLECTION
// ========================================
print("1. Creating ChatHistories collection...");
try {
  db.createCollection("chathistories", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "message", "response", "timestamp"],
        properties: {
          userId: { bsonType: "objectId" },
          message: { bsonType: "string" },
          response: { bsonType: "string" },
          model: { bsonType: "string" },
          tokens: { bsonType: "int" },
          timestamp: { bsonType: "date" }
        }
      }
    }
  });
  print("   ✓ Collection created");
} catch (e) {
  print("   ⚠ Collection already exists or error: " + e.message);
}

// Create indexes
db.chathistories.createIndex({ userId: 1, timestamp: -1 });
db.chathistories.createIndex({ timestamp: -1 });
print("   ✓ Indexes created\n");

// ========================================
// 2. CREATE AUDITLOGS COLLECTION
// ========================================
print("2. Creating AuditLogs collection...");
try {
  db.createCollection("auditlogs", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["adminId", "action", "resourceType", "timestamp"],
        properties: {
          adminId: { bsonType: "objectId" },
          adminEmail: { bsonType: "string" },
          action: { bsonType: "string" },
          resourceType: { bsonType: "string" },
          resourceId: { bsonType: "string" },
          changes: { bsonType: "object" },
          ipAddress: { bsonType: "string" },
          userAgent: { bsonType: "string" },
          timestamp: { bsonType: "date" }
        }
      }
    }
  });
  print("   ✓ Collection created");
} catch (e) {
  print("   ⚠ Collection already exists or error: " + e.message);
}

// Create indexes
db.auditlogs.createIndex({ adminId: 1, timestamp: -1 });
db.auditlogs.createIndex({ resourceType: 1, resourceId: 1 });
db.auditlogs.createIndex({ timestamp: -1 });
db.auditlogs.createIndex({ action: 1 });
print("   ✓ Indexes created\n");

// ========================================
// 3. CREATE NOTIFICATIONS COLLECTION
// ========================================
print("3. Creating Notifications collection...");
try {
  db.createCollection("notifications", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "type", "message", "isRead", "createdAt"],
        properties: {
          userId: { bsonType: "objectId" },
          type: { 
            enum: ["info", "warning", "success", "error", "admin"] 
          },
          title: { bsonType: "string" },
          message: { bsonType: "string" },
          actionUrl: { bsonType: "string" },
          isRead: { bsonType: "bool" },
          readAt: { bsonType: "date" },
          createdAt: { bsonType: "date" }
        }
      }
    }
  });
  print("   ✓ Collection created");
} catch (e) {
  print("   ⚠ Collection already exists or error: " + e.message);
}

// Create indexes
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: -1 });
print("   ✓ Indexes created\n");

// ========================================
// 4. ADD INDEXES TO USERS COLLECTION
// ========================================
print("4. Adding indexes to Users collection...");
try {
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ role: 1 });
  db.users.createIndex({ emailVerified: 1 });
  db.users.createIndex({ createdAt: -1 });
  print("   ✓ Indexes created\n");
} catch (e) {
  print("   ⚠ Some indexes may already exist: " + e.message + "\n");
}

// ========================================
// 5. ADD INDEXES TO REVIEWS COLLECTION
// ========================================
print("5. Adding indexes to Reviews collection...");
try {
  db.reviews.createIndex({ status: 1 });
  db.reviews.createIndex({ createdAt: -1 });
  db.reviews.createIndex({ rating: 1 });
  db.reviews.createIndex({ moderatedBy: 1 });
  db.reviews.createIndex({ status: 1, createdAt: -1 });
  print("   ✓ Indexes created\n");
} catch (e) {
  print("   ⚠ Some indexes may already exist: " + e.message + "\n");
}

// ========================================
// 6. ADD INDEXES TO SESSIONS COLLECTION
// ========================================
print("6. Adding indexes to Sessions collection...");
try {
  db.sessions.createIndex({ userId: 1 });
  db.sessions.createIndex({ isActive: 1 });
  db.sessions.createIndex({ startTime: -1 });
  db.sessions.createIndex({ userId: 1, isActive: 1 });
  // TTL index: auto-delete sessions after 30 days
  db.sessions.createIndex({ startTime: 1 }, { expireAfterSeconds: 2592000 });
  print("   ✓ Indexes created (with 30-day TTL)\n");
} catch (e) {
  print("   ⚠ Some indexes may already exist: " + e.message + "\n");
}

// ========================================
// VERIFICATION
// ========================================
print("========================================");
print("Setup Verification");
print("========================================\n");

print("Collections created:");
db.getCollectionNames().forEach(function(collection) {
  print("   • " + collection);
});

print("\n✅ MongoDB setup complete!");
print("\nNext steps:");
print("1. Restart your Next.js application");
print("2. Visit /admin to test the dashboard");
print("3. Check analytics are loading correctly\n");
