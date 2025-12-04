// ChatHistories Collection Setup
// Stores AI chat conversation history for each user

print("Creating ChatHistories collection...");

// Create collection with schema validation
try {
  db.createCollection("chathistories", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "message", "response", "timestamp"],
        properties: {
          userId: {
            bsonType: "objectId",
            description: "Reference to user who sent the message"
          },
          message: {
            bsonType: "string",
            description: "User's message/question"
          },
          response: {
            bsonType: "string",
            description: "AI's response"
          },
          model: {
            bsonType: "string",
            description: "AI model used (e.g., llama-3.3-70b-versatile)"
          },
          tokens: {
            bsonType: "int",
            description: "Number of tokens used"
          },
          timestamp: {
            bsonType: "date",
            description: "When the conversation occurred"
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
db.chathistories.createIndex(
  { userId: 1, timestamp: -1 },
  { name: "userId_timestamp_idx" }
);
db.chathistories.createIndex(
  { timestamp: -1 },
  { name: "timestamp_idx" }
);

print("✓ ChatHistories setup complete\n");

// Show created indexes
print("Indexes:");
db.chathistories.getIndexes().forEach(function(idx) {
  print("  • " + idx.name);
});
