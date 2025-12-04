// Notifications Collection Setup
// Stores user notifications and system alerts

print("Creating Notifications collection...");

// Create collection with schema validation
try {
  db.createCollection("notifications", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "type", "message", "isRead", "createdAt"],
        properties: {
          userId: {
            bsonType: "objectId",
            description: "Reference to user who receives the notification"
          },
          type: {
            enum: ["info", "warning", "success", "error", "admin"],
            description: "Type/severity of notification"
          },
          title: {
            bsonType: "string",
            description: "Notification title"
          },
          message: {
            bsonType: "string",
            description: "Notification message content"
          },
          actionUrl: {
            bsonType: "string",
            description: "Optional URL for user action (e.g., view details)"
          },
          isRead: {
            bsonType: "bool",
            description: "Whether user has read the notification"
          },
          readAt: {
            bsonType: "date",
            description: "When the notification was read"
          },
          createdAt: {
            bsonType: "date",
            description: "When the notification was created"
          }
        }
      }
    }
  });
  print("✓ Collection created successfully");
} catch (e) {
  print("⚠ Collection already exists or error: " + e.message);
}

// Create indexes for performance
print("Creating indexes...");
db.notifications.createIndex(
  { userId: 1, isRead: 1, createdAt: -1 },
  { name: "userId_isRead_createdAt_idx" }
);
db.notifications.createIndex(
  { createdAt: -1 },
  { name: "createdAt_idx" }
);

print("✓ Notifications setup complete\n");

// Show created indexes
print("Indexes:");
db.notifications.getIndexes().forEach(function(idx) {
  print("  • " + idx.name);
});
