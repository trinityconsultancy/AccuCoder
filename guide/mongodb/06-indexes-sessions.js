// Sessions Collection Indexes
// Adds performance indexes to existing Sessions collection
// Includes TTL index for automatic cleanup

print("Adding indexes to Sessions collection...");

try {
  // Index on userId for user session queries
  db.sessions.createIndex(
    { userId: 1 },
    { name: "userId_idx" }
  );
  print("✓ User ID index created");
} catch (e) {
  print("⚠ User ID index may already exist: " + e.message);
}

try {
  // Index on isActive for active session queries
  db.sessions.createIndex(
    { isActive: 1 },
    { name: "isActive_idx" }
  );
  print("✓ Is active index created");
} catch (e) {
  print("⚠ Is active index may already exist: " + e.message);
}

try {
  // Index on startTime for sorting by session start
  db.sessions.createIndex(
    { startTime: -1 },
    { name: "startTime_idx" }
  );
  print("✓ Start time index created");
} catch (e) {
  print("⚠ Start time index may already exist: " + e.message);
}

try {
  // Compound index for active user sessions
  db.sessions.createIndex(
    { userId: 1, isActive: 1 },
    { name: "userId_isActive_idx" }
  );
  print("✓ User ID + is active compound index created");
} catch (e) {
  print("⚠ Compound index may already exist: " + e.message);
}

try {
  // TTL index: auto-delete sessions after 30 days (2,592,000 seconds)
  db.sessions.createIndex(
    { startTime: 1 },
    { 
      expireAfterSeconds: 2592000,
      name: "startTime_ttl_idx"
    }
  );
  print("✓ TTL index created (30-day expiration)");
} catch (e) {
  print("⚠ TTL index may already exist: " + e.message);
}

print("✓ Sessions indexes setup complete\n");

// Show all indexes
print("Current indexes on Sessions collection:");
db.sessions.getIndexes().forEach(function(idx) {
  var ttl = idx.expireAfterSeconds ? " (TTL: " + idx.expireAfterSeconds + "s)" : "";
  print("  • " + idx.name + ttl);
});

print("\nNote: TTL index will automatically delete sessions older than 30 days");
