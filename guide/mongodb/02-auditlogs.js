// AuditLogs Collection Setup
// Tracks all admin actions for compliance and security

print("Creating AuditLogs collection...");

// Create collection with schema validation
try {
  db.createCollection("auditlogs", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["adminId", "action", "resourceType", "timestamp"],
        properties: {
          adminId: {
            bsonType: "objectId",
            description: "Reference to admin user who performed the action"
          },
          adminEmail: {
            bsonType: "string",
            description: "Email of admin user for easier tracking"
          },
          action: {
            bsonType: "string",
            description: "Action performed (e.g., 'review_approved', 'user_deleted')"
          },
          resourceType: {
            bsonType: "string",
            description: "Type of resource affected (e.g., 'review', 'user')"
          },
          resourceId: {
            bsonType: "string",
            description: "ID of the affected resource"
          },
          changes: {
            bsonType: "object",
            description: "Before/after values of changed fields"
          },
          ipAddress: {
            bsonType: "string",
            description: "IP address of admin user"
          },
          userAgent: {
            bsonType: "string",
            description: "Browser/client information"
          },
          timestamp: {
            bsonType: "date",
            description: "When the action occurred"
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
db.auditlogs.createIndex(
  { adminId: 1, timestamp: -1 },
  { name: "adminId_timestamp_idx" }
);
db.auditlogs.createIndex(
  { resourceType: 1, resourceId: 1 },
  { name: "resource_idx" }
);
db.auditlogs.createIndex(
  { timestamp: -1 },
  { name: "timestamp_idx" }
);
db.auditlogs.createIndex(
  { action: 1 },
  { name: "action_idx" }
);

print("✓ AuditLogs setup complete\n");

// Show created indexes
print("Indexes:");
db.auditlogs.getIndexes().forEach(function(idx) {
  print("  • " + idx.name);
});
